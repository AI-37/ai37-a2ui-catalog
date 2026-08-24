import React from 'react';
import type {FieldProps} from '@ai37/a2ui-catalog-react/primitives';

/**
 * Поле со связкой через вложение — как сегодня в пакете. Нужно только на
 * странице сравнения: нынешний `LookupCombobox` про `Field` из Base UI не
 * знает, и его подпись указывала бы `htmlFor` в несуществующий id.
 */
export function PlainField({label, children}: FieldProps) {
  return (
    <label className="a2ui-field">
      <span className="a2ui-field__label a2ui-t--sub a2ui-t--strong">{label}</span>
      {children}
    </label>
  );
}
