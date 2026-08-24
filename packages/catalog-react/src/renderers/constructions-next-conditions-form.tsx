import React from 'react';
import {CardBody, Field, Form, NumberField, Static} from '../primitives';
import {ConstructionsNextBuildingTypeField} from './constructions-next-building-type-field';
import {ConstructionsNextCityField} from './constructions-next-city-field';
import {ConstructionsNextConditionField} from './constructions-next-condition-field';
import {ConstructionsNextGsopNote} from './constructions-next-gsop-note';
import {ConstructionsNextSourceNote} from './constructions-next-source-note';
import type {ConstructionsNextGeneralProps} from './constructions-next.types';
import {formatGsop} from './format-gsop';
import {readOptionClimate} from './read-option-climate';

/**
 * Климат второго ряда: обозначение с индексом (tот, zот) и расшифровка прямо в
 * подписи — плейсхолдер исчез бы после заполнения ровно тогда, когда форму
 * перечитывают. Шаг у температур дробный, у суток целый.
 */
const CLIMATE_FIELDS: Array<{
  key: 'tot' | 'zot' | 'tn';
  symbol: string;
  index: string;
  text: string;
  step: number;
}> = [
  {
    key: 'tot',
    symbol: 't',
    index: 'от',
    text: 'средняя темп. отопительного периода, °C',
    step: 0.1,
  },
  {
    key: 'zot',
    symbol: 'z',
    index: 'от',
    text: 'продолжительность отопит. периода, сут/год',
    step: 1,
  },
  {
    key: 'tn',
    symbol: 't',
    index: 'н',
    text: 'темп. наиб. холодной пятидневки (0,92), °C',
    step: 1,
  },
];

/** ГСОП считает агент; пока снапшота нет — прочерк, а не пустой контрол. */
const GSOP_LABEL = 'ГСОП — градусо-сутки отопит. периода, °C·сут/год';

/**
 * Форма условий: два ряда полей внутри карточки секции. Поля, порядок и
 * подписи — те же, что у нынешнего рендерера: два экрана на одном наполнении
 * должны отличаться исполнением, а не содержанием.
 *
 * Состоянием владеет редактор — форма поднимает правки целым блоком `general`
 * и списком тронутых ключей. Выбор города подставляет tот/zот/tн из полей
 * опции; подставленные значения остаются редактируемыми, ничего не блокируется.
 */
export function ConstructionsNextConditionsForm({
  general,
  sources,
  buildingTypeOptions,
  cityReferenceId,
  minChars,
  onChange,
}: ConstructionsNextGeneralProps) {
  const setNumber = (key: 'tot' | 'zot' | 'tn' | 'tv', value: number | null) => {
    onChange({...general, [key]: value}, [key]);
  };

  return (
    <CardBody>
      <Form columns={2}>
        <Field label="Город строительства">
          <ConstructionsNextCityField
            referenceId={cityReferenceId}
            minChars={minChars}
            text={general.city?.label ?? ''}
            onTextChange={text =>
              onChange({...general, city: text ? {value: text, label: text} : null}, ['city'])
            }
            onPick={option => {
              const climate = readOptionClimate(option);
              onChange({...general, city: {value: option.value, label: option.label}, ...climate}, [
                'city',
                ...(Object.keys(climate) as Array<'tot' | 'zot' | 'tn'>),
              ]);
            }}
          />
          <ConstructionsNextSourceNote source={sources.city} />
        </Field>
        <Field label="Назначение помещений">
          <ConstructionsNextBuildingTypeField
            options={buildingTypeOptions}
            value={general.buildingType}
            onChange={value => onChange({...general, buildingType: value}, ['buildingType'])}
          />
          <ConstructionsNextSourceNote source={sources.buildingType} />
        </Field>
        <Field
          label={
            <>
              Температура внутреннего воздуха t<sub className="a2ui-field__index">в</sub>
            </>
          }
        >
          <NumberField value={general.tv} onValueChange={value => setNumber('tv', value)} />
          <ConstructionsNextSourceNote source={sources.tv} />
        </Field>
        <Field label="Условия эксплуатации">
          <ConstructionsNextConditionField
            value={general.condition}
            onChange={value => onChange({...general, condition: value}, ['condition'])}
          />
          <ConstructionsNextSourceNote source={sources.condition} />
        </Field>
      </Form>

      <Form columns={2}>
        {CLIMATE_FIELDS.map(field => (
          <Field
            key={field.key}
            label={
              <>
                {field.symbol}
                <sub className="a2ui-field__index">{field.index}</sub> — {field.text}
              </>
            }
          >
            <NumberField
              value={general[field.key]}
              step={field.step}
              onValueChange={value => setNumber(field.key, value)}
            />
            <ConstructionsNextSourceNote source={sources[field.key]} />
          </Field>
        ))}
        <Field label={GSOP_LABEL}>
          <Static>
            {general.gsop === null || general.gsop === undefined ? '—' : formatGsop(general.gsop)}
          </Static>
          <ConstructionsNextGsopNote general={general} sources={sources} />
        </Field>
      </Form>
    </CardBody>
  );
}
