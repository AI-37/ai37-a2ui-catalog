import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorLayerRowProps} from './constructions-editor.types';
import {LookupCombobox} from './lookup-combobox';
import {readOptionLambda} from './read-option-lambda';
import {resolveLayerLambda} from './resolve-layer-lambda';
import {controlStyle, fieldLabelStyle, fieldStyle, FIELD_COLUMN_WIDTH} from './shared';
import {tokens} from './tokens';
import {useLookupSuggest} from './use-lookup-suggest';

/**
 * Строка слоя: lookup материала (fetch-канал справочника прил. М), толщина и
 * λ. Выбор опции с λА/λБ заполняет `materialKey` и λ строки («авто»); опция
 * без λ или свободный текст — ручной ввод `lambdaManual`.
 * Строки-зазоры λ не требуют: их Rs считает сервер в итоговом расчёте.
 */
export function ConstructionsEditorLayerRow({
  layer,
  rowName,
  condition,
  materialsReferenceId,
  minChars,
  onChange,
  onRemove,
}: ConstructionsEditorLayerRowProps) {
  const {options, handleInputText, closeOptions} = useLookupSuggest({
    referenceId: materialsReferenceId,
    minChars,
  });

  const isGap = layer.kind !== undefined && layer.kind !== 'material';
  const hasReferenceLambda =
    typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number';
  const selected: LookupOption | null = layer.materialKey
    ? {value: layer.materialKey, label: layer.material}
    : null;

  const handleMaterialInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // Свободный текст сбрасывает выбор из справочника — строка переходит на
    // ручную λ (или остаётся зазором без λ).
    onChange({
      ...layer,
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
    onChange({
      ...layer,
      material: option.label,
      materialKey: option.value,
      lambdaA,
      lambdaB,
      lambdaManual: hasLambda ? undefined : layer.lambdaManual,
    });
    closeOptions();
  };

  const handleThicknessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    onChange({...layer, thicknessMm: Number.isFinite(parsed) ? parsed : null});
  };

  const handleLambdaManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    onChange({...layer, lambdaManual: Number.isFinite(parsed) ? parsed : undefined});
  };

  const resolvedLambda = resolveLayerLambda(layer, condition);

  return (
    // Материал — своя строка на всю ширину (названия из справочника длинные),
    // толщина и λ — следующей, парой.
    <div
      style={{
        display: 'grid',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${tokens.borderSubtle}`,
        background: tokens.surface,
        // Та же колонка, что у полей шапки и вкладки общих данных;
        // border-box — чтобы 420 были внешней шириной при любом reset'е хоста.
        maxWidth: FIELD_COLUMN_WIDTH,
        boxSizing: 'border-box',
      }}
    >
      <div style={{display: 'flex', alignItems: 'end', gap: 8}}>
        <label style={{...fieldStyle, flex: 1, minWidth: 0}}>
          <span style={fieldLabelStyle}>Материал</span>
          <LookupCombobox
            name={rowName}
            placeholder="Материал из справочника или свой"
            inputText={layer.material}
            selected={selected}
            options={options}
            onInputChange={handleMaterialInput}
            onPick={handleMaterialPick}
            onClose={closeOptions}
          />
        </label>
        <button
          type="button"
          aria-label="Удалить слой"
          onClick={onRemove}
          style={{
            padding: '8px 6px',
            border: 'none',
            background: 'transparent',
            color: tokens.textSubtle,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
        <label style={{...fieldStyle, width: 140}}>
          <span style={fieldLabelStyle}>Толщина, мм</span>
          <input
            type="number"
            min={1}
            step="any"
            value={layer.thicknessMm ?? ''}
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
              value={layer.lambdaManual ?? ''}
              onChange={handleLambdaManualChange}
              style={controlStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
