import React from 'react';
import type {ConstructionLayer, LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorLayerRowProps} from './constructions-editor.types';
import {layersEqual} from './layers-equal';
import {LookupCombobox} from './lookup-combobox';
import {readOptionLambda} from './read-option-lambda';
import {resolveLayerLambda} from './resolve-layer-lambda';
import {
  cancelButtonStyle,
  commitButtonStyle,
  controlStyle,
  fieldLabelStyle,
  fieldStyle,
  FIELD_COLUMN_WIDTH,
} from './shared';
import {tokens} from './tokens';
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
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        // Явно: хостовые стили кнопок (`.a2ui-surface button` и подобные)
        // центрируют flex-содержимое — сводка превращается в кашу по центру.
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        gap: '2px 10px',
        padding: '8px 12px',
        borderRadius: 12,
        border: `1px solid ${tokens.borderSubtle}`,
        background: tokens.surface,
        color: tokens.text,
        fontSize: '0.9rem',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        maxWidth: FIELD_COLUMN_WIDTH,
        boxSizing: 'border-box',
      }}
    >
      <span style={{color: tokens.textSubtle, fontVariantNumeric: 'tabular-nums'}}>
        №{index + 1}
      </span>
      <span
        style={{
          color: materialMissing ? tokens.warning : tokens.textStrong,
          fontWeight: 500,
          flex: 1,
          minWidth: 0,
          overflowWrap: 'anywhere',
        }}
      >
        {materialMissing ? 'материал не указан' : layer.material}
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          whiteSpace: 'nowrap',
          marginLeft: 'auto',
        }}
      >
        <span style={{color: thicknessMissing ? tokens.warning : tokens.text}}>
          {thicknessMissing ? 'толщина не задана' : `${layer.thicknessMm} мм`}
        </span>
        <span style={{color: tokens.textSubtle}}>·</span>
        {isGap ? (
          <span style={{color: tokens.textMuted}}>Rs — в итоговом расчёте</span>
        ) : hasManual ? (
          <span>λ {layer.lambdaManual}</span>
        ) : hasReferenceLambda ? (
          <span>
            λ {resolveLayerLambda(layer, condition)}
            <span style={{color: tokens.textSubtle, fontSize: '0.8rem'}}> авто</span>
          </span>
        ) : (
          <span style={{color: tokens.warning}}>λ не задана</span>
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
    // толщина и λ — следующей, парой, кнопки коммита — последней.
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${tokens.borderStrong}`,
        background: tokens.surface,
        // Та же колонка, что у полей шапки и вкладки общих данных;
        // border-box — чтобы 420 были внешней шириной при любом reset'е хоста.
        maxWidth: FIELD_COLUMN_WIDTH,
        boxSizing: 'border-box',
      }}
    >
      <label style={{...fieldStyle, minWidth: 0}}>
        <span style={fieldLabelStyle}>Материал</span>
        <LookupCombobox
          name={rowName}
          placeholder="Материал из справочника или свой"
          inputText={draft.material}
          selected={selected}
          options={options}
          onInputChange={handleMaterialInput}
          onPick={handleMaterialPick}
          onClose={closeOptions}
        />
      </label>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
        <label style={{...fieldStyle, width: 140}}>
          <span style={fieldLabelStyle}>Толщина, мм</span>
          <input
            type="number"
            min={1}
            step="any"
            value={draft.thicknessMm ?? ''}
            onChange={handleThicknessChange}
            style={controlStyle}
          />
        </label>
        <div style={{...fieldStyle, width: 200}}>
          <span style={fieldLabelStyle}>λ, Вт/(м·°C)</span>
          {isGap ? (
            <span style={{color: tokens.textMuted, fontSize: '0.85rem', alignSelf: 'center'}}>
              Rs — в итоговом расчёте
            </span>
          ) : hasReferenceLambda ? (
            <span style={{color: tokens.text, alignSelf: 'center'}}>
              {resolvedLambda}
              <span style={{color: tokens.textSubtle, fontSize: '0.8rem'}}> авто</span>
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
              style={controlStyle}
            />
          )}
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <button type="button" onClick={handleApply} style={commitButtonStyle}>
          {mode === 'new' ? 'Добавить' : 'Применить'}
        </button>
        <button type="button" onClick={onCancel} style={cancelButtonStyle}>
          Отмена
        </button>
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={onRemove}
            style={{
              marginLeft: 'auto',
              padding: '6px 4px',
              border: 'none',
              background: 'transparent',
              color: tokens.danger,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Удалить слой
          </button>
        ) : null}
      </div>
    </div>
  );
}
