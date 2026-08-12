import React from 'react';
import type {ConstructionLayer, LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorLayerRowProps} from './constructions-editor.types';
import {layersEqual} from './layers-equal';
import {LookupCombobox} from './lookup-combobox';
import {readOptionLambda} from './read-option-lambda';
import {resolveLayerLambda} from './resolve-layer-lambda';
import {useLookupSuggest} from './use-lookup-suggest';

/**
 * Строка слоя в двух режимах. `summary` — компактная сводка
 * «№ · материал · толщина · λ», кликом раскрывается в форму. `edit`/`new` —
 * форма с lookup'ом материала (fetch-канал справочника прил. М), толщиной и λ;
 * правки живут в локальной копии и попадают наверх только по коммиту
 * («Применить»/«Добавить»), «Отмена» отбрасывает копию. Строки-зазоры λ не
 * требуют: их Rs считает сервер в итоговом расчёте.
 */
export function ConstructionsEditorLayerRow(props: ConstructionsEditorLayerRowProps) {
  if (props.mode === 'summary') {
    return <LayerSummary {...props} />;
  }

  return <LayerForm {...props} />;
}

/**
 * Сводка: вся строка — кнопка (клавиатура и role бесплатно). Иерархия
 * скана: номер приглушён, материал — основной текст, числа (толщина · λ)
 * прижаты вправо. Незаполненные поля невалидного слоя подсвечены
 * предупреждающим цветом.
 */
function LayerSummary({layer, index, condition, onOpen}: ConstructionsEditorLayerRowProps) {
  const isGap = layer.kind !== undefined && layer.kind !== 'material';
  const hasManual = typeof layer.lambdaManual === 'number';
  const hasReferenceLambda =
    typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number';
  const materialMissing = layer.material.trim() === '';
  const thicknessMissing = layer.thicknessMm === null || layer.thicknessMm <= 0;

  return (
    <button type="button" onClick={onOpen} className="a2ui-ce-layer">
      <span className="a2ui-ce-layer__no">№{index + 1}</span>
      <span
        className={`a2ui-ce-layer__material${materialMissing ? ' a2ui-ce-layer__warn' : ''}`}
      >
        {materialMissing ? 'материал не указан' : layer.material}
      </span>
      <span className="a2ui-ce-layer__numbers">
        <span className={thicknessMissing ? 'a2ui-ce-layer__warn' : undefined}>
          {thicknessMissing ? 'толщина не задана' : `${layer.thicknessMm} мм`}
        </span>
        <span className="a2ui-ce-layer__dot">·</span>
        {isGap ? (
          <span className="a2ui-ce-layer__hint">Rs — в итоговом расчёте</span>
        ) : hasManual ? (
          <span>λ {layer.lambdaManual}</span>
        ) : hasReferenceLambda ? (
          <span>
            λ {resolveLayerLambda(layer, condition)}
            <span className="a2ui-ce-auto"> авто</span>
          </span>
        ) : (
          <span className="a2ui-ce-layer__warn">λ не задана</span>
        )}
      </span>
    </button>
  );
}

/**
 * Форма правки/добавления: локальная копия слоя в state с момента открытия,
 * наружу уходит только по коммиту. «Применить» без изменений равносилен
 * «Отмене» — черновик наверху не порождается.
 */
function LayerForm({
  layer,
  rowName,
  condition,
  materialsReferenceId,
  minChars,
  mode,
  onCommit,
  onCancel,
  onRemove,
}: ConstructionsEditorLayerRowProps) {
  const [draft, setDraft] = React.useState<ConstructionLayer>(layer);
  const {options, handleInputText, closeOptions} = useLookupSuggest({
    referenceId: materialsReferenceId,
    minChars,
  });

  const isGap = draft.kind !== undefined && draft.kind !== 'material';
  const hasReferenceLambda =
    typeof draft.lambdaA === 'number' || typeof draft.lambdaB === 'number';
  const selected: LookupOption | null = draft.materialKey
    ? {value: draft.materialKey, label: draft.material}
    : null;

  const handleMaterialInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // Свободный текст сбрасывает выбор из справочника — строка переходит на
    // ручную λ (или остаётся зазором без λ).
    setDraft({
      ...draft,
      material: text,
      materialKey: undefined,
      lambdaA: undefined,
      lambdaB: undefined,
    });
    handleInputText(text);
  };

  const handleMaterialPick = (option: LookupOption) => {
    const lambdaA = readOptionLambda(option, 'lambdaA');
    const lambdaB = readOptionLambda(option, 'lambdaB');
    const hasLambda = lambdaA !== undefined || lambdaB !== undefined;

    // λ из опции вытесняет ручную: resolveLayerLambda предпочитает
    // lambdaManual, оставить её — значит молча игнорировать справочник.
    setDraft({
      ...draft,
      material: option.label,
      materialKey: option.value,
      lambdaA,
      lambdaB,
      lambdaManual: hasLambda ? undefined : draft.lambdaManual,
    });
    closeOptions();
  };

  const handleThicknessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    setDraft({...draft, thicknessMm: Number.isFinite(parsed) ? parsed : null});
  };

  const handleLambdaManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    setDraft({...draft, lambdaManual: Number.isFinite(parsed) ? parsed : undefined});
  };

  const handleApply = () => {
    // Без изменений коммит вырождается в закрытие формы: черновик не шлётся.
    if (mode === 'edit' && layersEqual(draft, layer)) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  const resolvedLambda = resolveLayerLambda(draft, condition);

  return (
    // Материал — своя строка на всю ширину (названия из справочника длинные),
    // толщина и λ — следующей, парой (на узком контейнере — друг под другом),
    // кнопки коммита — последней.
    <div className="a2ui-ce-form">
      <label className="a2ui-ce-field">
        <span className="a2ui-ce-field__label">Материал</span>
        <LookupCombobox
          name={rowName}
          placeholder="Материал из справочника или свой"
          inputText={draft.material}
          selected={selected}
          options={options}
          onInputChange={handleMaterialInput}
          onPick={handleMaterialPick}
          onClose={closeOptions}
          inputClassName="a2ui-ce-control"
        />
      </label>
      <div className="a2ui-ce-pair">
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">Толщина, мм</span>
          <input
            type="number"
            min={1}
            step="any"
            value={draft.thicknessMm ?? ''}
            onChange={handleThicknessChange}
            className="a2ui-ce-control"
          />
        </label>
        <div className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">λ, Вт/(м·°C)</span>
          {isGap ? (
            <span className="a2ui-ce-static a2ui-ce-static--muted">Rs — в итоговом расчёте</span>
          ) : hasReferenceLambda ? (
            <span className="a2ui-ce-static">
              {resolvedLambda}
              <span className="a2ui-ce-auto"> авто</span>
            </span>
          ) : (
            <input
              type="number"
              min={0.001}
              step="any"
              aria-label="λ, Вт/(м·°C), вручную"
              placeholder="λ вручную"
              value={draft.lambdaManual ?? ''}
              onChange={handleLambdaManualChange}
              className="a2ui-ce-control"
            />
          )}
        </div>
      </div>
      <div className="a2ui-ce-actions">
        <button type="button" onClick={handleApply} className="a2ui-ce-btn a2ui-ce-btn--commit">
          {mode === 'new' ? 'Добавить' : 'Применить'}
        </button>
        <button type="button" onClick={onCancel} className="a2ui-ce-btn">
          Отмена
        </button>
        {mode === 'edit' ? (
          <button type="button" onClick={onRemove} className="a2ui-ce-btn a2ui-ce-btn--danger">
            Удалить слой
          </button>
        ) : null}
      </div>
    </div>
  );
}
