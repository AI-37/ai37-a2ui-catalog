import React from 'react';
import type {ConstructionsGeneral, LookupOption} from '@ai37/a2ui-catalog-schemas';
import {ConstructionsEditorSelect} from './constructions-editor-select';
import {ConstructionsEditorSourceNote} from './constructions-editor-source-note';
import type {ConstructionsEditorGeneralProps} from './constructions-editor.types';
import {fieldSourceControlClass} from './field-source-control-class';
import {formatGsop} from './format-gsop';
import {LookupCombobox} from './lookup-combobox';
import {readOptionClimate} from './read-option-climate';
import {useLookupSuggest} from './use-lookup-suggest';

/**
 * Климат второго ряда: обозначение с индексом (tот, zот) и расшифровка прямо в
 * подписи — плейсхолдер исчез бы после заполнения ровно тогда, когда форму
 * перечитывают.
 */
const CLIMATE_FIELDS: Array<{
  key: 'tot' | 'zot' | 'tn';
  symbol: string;
  index: string;
  text: string;
}> = [
  {key: 'tot', symbol: 't', index: 'от', text: 'средняя темп. отопительного периода, °C'},
  {key: 'zot', symbol: 'z', index: 'от', text: 'продолжительность отопит. периода, сут/год'},
  {key: 'tn', symbol: 't', index: 'н', text: 'темп. наиб. холодной пятидневки (0,92), °C'},
];

/**
 * Раскрытая сетка блока «Условия»: четыре значимых поля макета — регион (город
 * из справочника с ГСОП от агента), назначение помещений, tв и условия
 * эксплуатации. Остальной климат (tот/zот/tн) идёт отдельным рядом ниже:
 * прятать редактируемое значение так, чтобы его нельзя было найти, хуже, чем
 * показать компактной строкой (Решение 8 design.md).
 *
 * Состоянием владеет редактор — сетка поднимает правки целым блоком `general`
 * и списком тронутых ключей. Выбор города подставляет tот/zот/tн из полей
 * опции; подставленные значения остаются редактируемыми, ничего не блокируется.
 */
export function ConstructionsEditorGeneral({
  general,
  sources,
  showGsop,
  buildingTypeOptions,
  cityReferenceId,
  minChars,
  onChange,
}: ConstructionsEditorGeneralProps) {
  const {options, loading, queried, handleInputText, closeOptions} = useLookupSuggest({
    referenceId: cityReferenceId ?? '',
    minChars,
  });

  const selectedCity: LookupOption | null = general.city;

  const handleCityInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    // Свободный текст остаётся значением поля: агент разберётся, что города
    // вне справочника у него нет, — блокировать ввод не наше дело.
    onChange({...general, city: text ? {value: text, label: text} : null}, ['city']);
    if (cityReferenceId) handleInputText(text);
  };

  const handleCityPick = (option: LookupOption) => {
    const climate = readOptionClimate(option);
    onChange({...general, city: {value: option.value, label: option.label}, ...climate}, [
      'city',
      ...(Object.keys(climate) as Array<'tot' | 'zot' | 'tn'>),
    ]);
    closeOptions();
  };

  const handleNumberChange = (key: 'tot' | 'zot' | 'tn' | 'tv', raw: string) => {
    const parsed = Number.parseFloat(raw);
    onChange({...general, [key]: Number.isFinite(parsed) ? parsed : null}, [key]);
  };

  const gsop = showGsop && general.gsop !== null && general.gsop !== undefined ? general.gsop : null;

  return (
    <>
      <div className="a2ui-ce-conditions__grid">
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">Регион строительства</span>
          <LookupCombobox
            name="constructions-general-city"
            placeholder="Город из справочника"
            inputText={general.city?.label ?? ''}
            selected={selectedCity}
            options={options}
            loading={loading}
            queried={queried}
            onInputChange={handleCityInput}
            onPick={handleCityPick}
            onClose={closeOptions}
            inputClassName={fieldSourceControlClass(sources.city)}
          />
          {sources.city ? <ConstructionsEditorSourceNote source={sources.city} /> : null}
        </label>
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">Назначение помещений</span>
          {buildingTypeOptions && buildingTypeOptions.length > 0 ? (
            <ConstructionsEditorSelect
              value={general.buildingType ?? ''}
              onChange={event =>
                onChange({...general, buildingType: event.target.value || null}, ['buildingType'])
              }
              className={fieldSourceControlClass(sources.buildingType)}
            >
              <option value="">—</option>
              {buildingTypeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </ConstructionsEditorSelect>
          ) : (
            <input
              type="text"
              value={general.buildingType ?? ''}
              onChange={event =>
                onChange({...general, buildingType: event.target.value || null}, ['buildingType'])
              }
              className={fieldSourceControlClass(sources.buildingType)}
            />
          )}
          {sources.buildingType ? (
            <ConstructionsEditorSourceNote source={sources.buildingType} />
          ) : null}
        </label>
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">
            Температура внутреннего воздуха t<sub className="a2ui-ce-field__index">в</sub>
          </span>
          <input
            type="number"
            step="any"
            value={general.tv ?? ''}
            onChange={event => handleNumberChange('tv', event.target.value)}
            className={fieldSourceControlClass(sources.tv)}
          />
          {sources.tv ? <ConstructionsEditorSourceNote source={sources.tv} /> : null}
        </label>
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">Условия эксплуатации</span>
          <ConstructionsEditorSelect
            value={general.condition ?? ''}
            onChange={event =>
              onChange(
                {
                  ...general,
                  condition: (event.target.value || null) as ConstructionsGeneral['condition'],
                },
                ['condition'],
              )
            }
            className={fieldSourceControlClass(sources.condition)}
          >
            {/* «Не задано» показываем, только пока значение пустое: null здесь
                означает λБ, и выбирать его отдельным пунктом незачем. */}
            {general.condition === null ? <option value="">—</option> : null}
            <option value="А">А</option>
            <option value="Б">Б</option>
          </ConstructionsEditorSelect>
          {sources.condition ? <ConstructionsEditorSourceNote source={sources.condition} /> : null}
        </label>
      </div>
      <div className="a2ui-ce-conditions__climate">
        {CLIMATE_FIELDS.map(field => (
          <label key={field.key} className="a2ui-ce-field">
            <span className="a2ui-ce-field__label">
              {field.symbol}
              <sub className="a2ui-ce-field__index">{field.index}</sub> — {field.text}
            </span>
            <input
              type="number"
              step="any"
              value={general[field.key] ?? ''}
              onChange={event => handleNumberChange(field.key, event.target.value)}
              className={fieldSourceControlClass(sources[field.key])}
            />
            {sources[field.key] ? (
              <ConstructionsEditorSourceNote source={sources[field.key]!} />
            ) : null}
          </label>
        ))}
        {/* ГСОП — четвёртое поле ряда, но не ввод: его считает агент. Поле
            стоит всегда, а значения нет («—»), пока агент не прислал или пока
            тронут климат — присланное протухло (Решение 3 design.md). */}
        <div className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">
            ГСОП — градусо-сутки отопит. периода, °C·сут/год
          </span>
          {/* Не контрол, а значение: править ГСОП нельзя, и коробка поля звала
              бы это делать. */}
          <span className="a2ui-ce-static">{gsop === null ? '—' : formatGsop(gsop)}</span>
          {gsop !== null && sources.gsop ? (
            <ConstructionsEditorSourceNote source={sources.gsop} />
          ) : null}
        </div>
      </div>
    </>
  );
}
