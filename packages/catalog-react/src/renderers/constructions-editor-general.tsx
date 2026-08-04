import React from 'react';
import type {ConstructionsGeneral, LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorGeneralProps} from './constructions-editor.types';
import {LookupCombobox} from './lookup-combobox';
import {readOptionClimate} from './read-option-climate';
import {controlStyle, fieldLabelStyle, fieldStyle, FIELD_COLUMN_WIDTH} from './shared';
import {useLookupSuggest} from './use-lookup-suggest';

/** Числовые поля климата вкладки: подпись → ключ блока `general`. */
const CLIMATE_FIELDS: Array<{key: 'tot' | 'zot' | 'tn' | 'tv'; label: string}> = [
  {key: 'tot', label: 'tот, °C'},
  {key: 'zot', label: 'zот, сут'},
  {key: 'tn', label: 'tн, °C'},
  {key: 'tv', label: 'tв, °C'},
];

/**
 * Вкладка «Общие данные»: тип здания, город из справочника, климат (СП 131) и
 * условие эксплуатации. Состоянием владеет редактор — вкладка поднимает
 * правки целым блоком `general`. Выбор города подставляет tот/zот/tн из полей
 * опции (тот же приём, что λА/λБ в строке слоя); подставленные значения
 * остаются редактируемыми, ничего не блокируется и не подсвечивается.
 */
export function ConstructionsEditorGeneral({
  general,
  buildingTypeOptions,
  cityReferenceId,
  minChars,
  onChange,
}: ConstructionsEditorGeneralProps) {
  const {options, handleInputText, closeOptions} = useLookupSuggest({
    referenceId: cityReferenceId ?? '',
    minChars,
  });

  const selectedCity: LookupOption | null = general.city;

  const handleCityInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // Свободный текст остаётся значением поля: агент разберётся, что города
    // вне справочника у него нет, — блокировать ввод не наше дело.
    onChange({...general, city: text ? {value: text, label: text} : null});
    if (cityReferenceId) handleInputText(text);
  };

  const handleCityPick = (option: LookupOption) => {
    onChange({
      ...general,
      city: {value: option.value, label: option.label},
      ...readOptionClimate(option),
    });
    closeOptions();
  };

  const handleNumberChange = (key: 'tot' | 'zot' | 'tn' | 'tv', raw: string) => {
    const parsed = Number.parseFloat(raw);
    onChange({...general, [key]: Number.isFinite(parsed) ? parsed : null});
  };

  return (
    // Поля в столбик: одна колонка читается сверху вниз как анкета и не
    // разъезжается на узком экране.
    <div style={{display: 'grid', gap: 12, maxWidth: FIELD_COLUMN_WIDTH}}>
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>Тип здания</span>
        {buildingTypeOptions && buildingTypeOptions.length > 0 ? (
          <select
            value={general.buildingType ?? ''}
            onChange={event => onChange({...general, buildingType: event.target.value || null})}
            style={controlStyle}
          >
            <option value="">—</option>
            {buildingTypeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={general.buildingType ?? ''}
            onChange={event => onChange({...general, buildingType: event.target.value || null})}
            style={controlStyle}
          />
        )}
      </label>
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>Город</span>
        <LookupCombobox
          name="constructions-general-city"
          placeholder="Город из справочника"
          inputText={general.city?.label ?? ''}
          selected={selectedCity}
          options={options}
          onInputChange={handleCityInput}
          onPick={handleCityPick}
          onClose={closeOptions}
        />
      </label>
      {CLIMATE_FIELDS.map(field => (
        <label key={field.key} style={fieldStyle}>
          <span style={fieldLabelStyle}>{field.label}</span>
          <input
            type="number"
            step="any"
            value={general[field.key] ?? ''}
            onChange={event => handleNumberChange(field.key, event.target.value)}
            style={controlStyle}
          />
        </label>
      ))}
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>Условие эксплуатации</span>
        <select
          value={general.condition ?? ''}
          onChange={event =>
            onChange({
              ...general,
              condition: (event.target.value || null) as ConstructionsGeneral['condition'],
            })
          }
          style={controlStyle}
        >
          <option value="">—</option>
          <option value="А">А</option>
          <option value="Б">Б</option>
        </select>
      </label>
    </div>
  );
}
