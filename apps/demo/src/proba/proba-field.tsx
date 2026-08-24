import React from 'react';
import type {FieldProps} from './proba-form.types';

/** Поле формы: подпись над контролом. `<label>`, поэтому `htmlFor` не нужен. */
export function Field({label, children}: FieldProps) {
  return (
    <label className="a2ui-field">
      <span className="a2ui-t--sub a2ui-t--strong">{label}</span>
      {children}
    </label>
  );
}
