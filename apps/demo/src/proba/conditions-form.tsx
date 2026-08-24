import React from 'react';
import {CardBody} from './proposed-card-body';
import {Field} from './proba-field';
import {Form} from './proba-form';
import {Input} from './proba-input';
import {Select} from './proba-select';
import {Static} from './proba-static';

/** Форма условий. Поля и порядок — из `constructions-editor-general.tsx`; свёрнутая секция её не рендерит. */
export function ConditionsForm({open}: {open: boolean}) {
  if (!open) {
    return null;
  }

  return (
    <CardBody>
      <Form columns={2}>
        <Field label="Регион строительства">
          <Input defaultValue="Москва" placeholder="Город из справочника" />
        </Field>
        <Field label="Назначение помещений">
          <Select defaultValue="Жилое многоквартирное">
            <option>Жилое многоквартирное</option>
            <option>Общественное</option>
          </Select>
        </Field>
        <Field
          label={
            <>
              Температура внутреннего воздуха t<sub className="a2ui-field__index">в</sub>
            </>
          }
        >
          <Input type="number" step="any" defaultValue={20} />
        </Field>
        <Field label="Условия эксплуатации">
          <Select defaultValue="Б">
            <option>А</option>
            <option>Б</option>
          </Select>
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
          <Input type="number" step="any" defaultValue={-2.2} />
        </Field>
        <Field
          label={
            <>
              z<sub className="a2ui-field__index">от</sub> — продолжительность отопит. периода,
              сут/год
            </>
          }
        >
          <Input type="number" step="any" defaultValue={205} />
        </Field>
        <Field
          label={
            <>
              t<sub className="a2ui-field__index">н</sub> — темп. наиб. холодной пятидневки (0,92),
              °C
            </>
          }
        >
          <Input type="number" step="any" defaultValue={-25} />
        </Field>
        <Field label="ГСОП — градусо-сутки отопит. периода, °C·сут/год">
          <Static>—</Static>
        </Field>
      </Form>
    </CardBody>
  );
}
