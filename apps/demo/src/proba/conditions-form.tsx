import React from 'react';
import {CardBody, Field, Form, Lookup, NumberField, Select, Static} from '@ai37/a2ui-catalog-react/primitives';
import type {ConditionsControl} from './use-conditions.types';

/** Назначения помещений — как в справочнике редактора. */
const BUILDING_TYPES = ['Жилое многоквартирное', 'Общественное'];

/** Условия эксплуатации по СП 50: два значения, третьего не бывает. */
const CONDITIONS = ['А', 'Б'];

/** Форма условий. Поля и порядок — из `constructions-editor-general.tsx`. */
export function ConditionsForm({control}: {control: ConditionsControl}) {
  const {state, setCityText, pickCity, setBuildingType, setCondition, setNumber} = control;

  return (
    <CardBody>
      <Form columns={2}>
        <Field label="Город строительства">
          <Lookup
            name="conditions-city"
            referenceId="cities"
            placeholder="Город из справочника"
            text={state.cityText}
            onTextChange={setCityText}
            onPick={pickCity}
          />
        </Field>
        <Field label="Назначение помещений">
          <Select
            items={BUILDING_TYPES}
            value={state.buildingType}
            onValueChange={setBuildingType}
            placeholder="—"
            name="conditions-building-type"
          />
        </Field>
        <Field
          label={
            <>
              Температура внутреннего воздуха t<sub className="a2ui-field__index">в</sub>
            </>
          }
        >
          <NumberField
            value={state.tv}
            onValueChange={value => setNumber('tv', value)}
            name="conditions-tv"
          />
        </Field>
        <Field label="Условия эксплуатации">
          <Select
            items={CONDITIONS}
            value={state.condition}
            onValueChange={setCondition}
            placeholder="—"
            name="conditions-condition"
          />
        </Field>
      </Form>

      <Form columns={2}>
        <Field
          label={
            <>
              t<sub className="a2ui-field__index">от</sub> — средняя темп. отопительного периода, °C
            </>
          }
        >
          <NumberField
            value={state.tot}
            onValueChange={value => setNumber('tot', value)}
            step={0.1}
            name="conditions-tot"
          />
        </Field>
        <Field
          label={
            <>
              z<sub className="a2ui-field__index">от</sub> — продолжительность отопит. периода,
              сут/год
            </>
          }
        >
          <NumberField
            value={state.zot}
            onValueChange={value => setNumber('zot', value)}
            name="conditions-zot"
          />
        </Field>
        <Field
          label={
            <>
              t<sub className="a2ui-field__index">н</sub> — темп. наиб. холодной пятидневки (0,92),
              °C
            </>
          }
        >
          <NumberField
            value={state.tn}
            onValueChange={value => setNumber('tn', value)}
            name="conditions-tn"
          />
        </Field>
        {/* ГСОП — поле экрана, но не ввод: его считает агент. Пока снапшота
            нет — «—», и коробки контрола здесь быть не должно. */}
        <Field label="ГСОП — градусо-сутки отопит. периода, °C·сут/год">
          <Static>—</Static>
        </Field>
      </Form>
    </CardBody>
  );
}
