import React from 'react';
import {Field} from './proba-field';
import {Form} from './proba-form';
import {Input} from './proba-input';
import {Select} from './proba-select';
import {Static} from './proba-static';
import {PROBA_FORM_CSS} from './proba-form-css';
import {PROBA_TYPOGRAPHY_CSS} from './proba-typography-css';
import {PROPOSED_CARD_CSS} from './proposed-card-css';

/** Готовая форма: сетка, поле, три вида содержимого поля. */
export function FormSystem() {
  return (
    <section className="a2ui-proba" style={sectionStyle}>
      <style href="proba-typography" precedence="default">{PROBA_TYPOGRAPHY_CSS}</style>
      <style href="proba-proposed-card" precedence="default">{PROPOSED_CARD_CSS}</style>
      <style href="proba-form" precedence="default">{PROBA_FORM_CSS}</style>

      <h2 style={h2Style}>
        Форма <code style={codeStyle}>Form · Field · Input · Select · Static</code>
      </h2>

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
        <Field
          label={
            <>
              t<sub className="a2ui-field__index">от</sub> — средняя темп. отопительного периода, °C
            </>
          }
        >
          <Input type="number" step="any" defaultValue={-2.2} />
        </Field>
        <Field label="ГСОП — градусо-сутки отопит. периода, °C·сут/год">
          <Static>—</Static>
        </Field>
      </Form>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.1)',
  background: '#ffffff',
};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};
const codeStyle: React.CSSProperties = {fontSize: 13, color: '#64748b', fontWeight: 400};
