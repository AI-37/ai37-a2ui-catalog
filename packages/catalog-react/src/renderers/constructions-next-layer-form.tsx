import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import {Button, Field, Form, Lookup, NumberField} from '../primitives';
import {ConstructionsNextKindField} from './constructions-next-kind-field';
import {ConstructionsNextLambdaField} from './constructions-next-lambda-field';
import {ConstructionsNextLayerRemove} from './constructions-next-layer-remove';
import type {ConstructionsNextLayerProps} from './constructions-next.types';
import {layerKindFromOption} from './layer-kind-from-option';
import {layerNeedsThickness} from './layer-needs-thickness';
import {layersEqual} from './layers-equal';
import {readOptionLambda} from './read-option-lambda';

/**
 * Форма правки/добавления слоя: локальная копия в state с момента открытия,
 * наружу — только по коммиту («Применить»/«Добавить»); «Отмена» отбрасывает
 * копию. «Применить» без изменений вырождается в закрытие формы — черновик
 * наверху не порождается.
 *
 * Каждое изменение копии уходит в `onDraftChange`: карточка считает по нему
 * превью Rпр для чипа. Это не коммит и state редактора не меняет.
 *
 * Вид слоя — селектором (`ConstructionsNextKindField`); спец-запись
 * справочника (зазор, тонкий слой) ставит тот же вид сразу при выборе
 * (`layerKindFromOption`). У вентилируемого зазора и тонкого слоя толщина не
 * нужна — поле остаётся, но с плейсхолдером «не нужна» и без нижней границы.
 */
export function ConstructionsNextLayerForm({
  layer,
  rowName,
  condition,
  materialsReferenceId,
  minChars,
  mode,
  onCommit,
  onCancel,
  onRemove,
  onDraftChange,
}: ConstructionsNextLayerProps) {
  const [draft, setDraft] = React.useState<ConstructionLayer>(layer);

  const updateDraft = (next: ConstructionLayer) => {
    setDraft(next);
    onDraftChange(next);
  };

  const handleApply = () => {
    // Без изменений коммит вырождается в закрытие формы: черновик не шлётся.
    if (mode === 'edit' && layersEqual(draft, layer)) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  return (
    <div style={formStyle}>
      {/* Одна сетка: в широком контейнере материал забирает строку, вид,
          толщина и λ встают второй строкой; в узком всё идёт столбцом. */}
      <Form columns={3}>
        <Field wide label="Материал">
          <Lookup
            name={rowName}
            referenceId={materialsReferenceId}
            placeholder="Материал из справочника или свой"
            text={draft.material}
            minChars={minChars}
            onTextChange={text =>
              // Свободный текст сбрасывает выбор из справочника — строка
              // переходит на ручную λ (или остаётся зазором без λ).
              updateDraft({
                ...draft,
                material: text,
                materialKey: undefined,
                lambdaA: undefined,
                lambdaB: undefined,
              })
            }
            onPick={option => {
              const lambdaA = readOptionLambda(option, 'lambdaA');
              const lambdaB = readOptionLambda(option, 'lambdaB');
              const hasLambda = lambdaA !== undefined || lambdaB !== undefined;
              // Спец-запись справочника (зазор, тонкий слой) — это выбор вида,
              // строка прил. М возвращает строку к материалу.
              const kind = layerKindFromOption(option);

              // λ из опции вытесняет ручную: resolveLayerLambda предпочитает
              // lambdaManual, оставить её — значит молча игнорировать справочник.
              updateDraft({
                ...draft,
                material: option.label,
                kind,
                materialKey: option.value,
                lambdaA,
                lambdaB,
                lambdaManual: hasLambda || kind !== undefined ? undefined : draft.lambdaManual,
              });
            }}
          />
        </Field>
        <ConstructionsNextKindField layer={draft} onChange={updateDraft} />
        <Field label="Толщина, мм">
          <NumberField
            value={draft.thicknessMm}
            {...(layerNeedsThickness(draft) ? {min: 1} : {placeholder: 'не нужна'})}
            compact
            onValueChange={value => updateDraft({...draft, thicknessMm: value})}
          />
        </Field>
        <Field label="λ, Вт/(м·°C)">
          <ConstructionsNextLambdaField
            layer={draft}
            condition={condition}
            onChange={lambdaManual => updateDraft({...draft, lambdaManual})}
          />
        </Field>
      </Form>

      <div style={actionsStyle}>
        <Button variant="filled" size="sm" onClick={handleApply}>
          {mode === 'new' ? 'Добавить' : 'Применить'}
        </Button>
        <Button size="sm" onClick={onCancel}>
          Отмена
        </Button>
        <ConstructionsNextLayerRemove mode={mode} onRemove={onRemove} />
      </div>
    </div>
  );
}

const formStyle: React.CSSProperties = {display: 'grid', gap: 12};

const actionsStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
