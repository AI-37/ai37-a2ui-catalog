import React from 'react';
import type {FormProps} from './proba-form.types';

/** Сетка полей. Контейнер — на обёртке: элемент не может спрашивать собственную ширину. */
export function Form({columns = 1, children}: FormProps) {
  return (
    <div className="a2ui-form-scope">
      <div className={`a2ui-form${columns === 2 ? ' a2ui-form--two' : ''}`}>{children}</div>
    </div>
  );
}
