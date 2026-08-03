import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorLayerRowProps} from './constructions-editor.types';
import {LookupCombobox} from './lookup-combobox';
import {readOptionLambda} from './read-option-lambda';
import {resolveLayerLambda} from './resolve-layer-lambda';
import {inputStyle} from './shared';
import {tokens} from './tokens';
import {useLookupSuggest} from './use-lookup-suggest';

/**
 * Строка слоя: lookup материала (fetch-канал справочника прил. М), толщина и
 * λ. Выбор опции с λА/λБ заполняет `materialKey` и λ строки («авто»); опция
 * без λ или свободный текст — обязательный ручной ввод `lambdaManual`.
 * Строки-зазоры λ не требуют: их Rs считает сервер в итоговом расчёте.
 */
export function ConstructionsEditorLayerRow({
  layer,
  rowName,
  condition,
  materialsReferenceId,
  minChars,
  errors,
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

  const invalidStyle = {border: `1px solid ${tokens.danger}`};
  const resolvedLambda = resolveLayerLambda(layer, condition);

  return (
    <tr>
      <td style={{padding: '4px 6px', minWidth: 220}}>
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
        {errors?.material ? (
          <span style={{color: tokens.danger, fontSize: '0.8rem'}}>Укажите материал</span>
        ) : null}
      </td>
      <td style={{padding: '4px 6px', width: 110}}>
        <input
          type="number"
          min={1}
          step="any"
          aria-label="Толщина, мм"
          aria-invalid={errors?.thickness || undefined}
          value={layer.thicknessMm ?? ''}
          onChange={handleThicknessChange}
          style={{...inputStyle, width: '100%', ...(errors?.thickness ? invalidStyle : null)}}
        />
      </td>
      <td style={{padding: '4px 6px', width: 160}}>
        {isGap ? (
          <span style={{color: tokens.textMuted, fontSize: '0.85rem'}}>
            Rs — в итоговом расчёте
          </span>
        ) : hasReferenceLambda ? (
          <span style={{color: tokens.text}}>
            {resolvedLambda}
            <span style={{color: tokens.textSubtle, fontSize: '0.8rem'}}> авто</span>
          </span>
        ) : (
          <input
            type="number"
            min={0.001}
            step="any"
            aria-label="λ, Вт/(м·°C), вручную"
            aria-invalid={errors?.lambda || undefined}
            placeholder="λ вручную"
            value={layer.lambdaManual ?? ''}
            onChange={handleLambdaManualChange}
            style={{...inputStyle, width: '100%', ...(errors?.lambda ? invalidStyle : null)}}
          />
        )}
      </td>
      <td style={{padding: '4px 6px', width: 40}}>
        <button
          type="button"
          aria-label="Удалить слой"
          onClick={onRemove}
          style={{
            border: 'none',
            background: 'transparent',
            color: tokens.textSubtle,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
