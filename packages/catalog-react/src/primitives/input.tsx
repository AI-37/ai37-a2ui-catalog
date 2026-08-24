import React from 'react';
import {Field as BaseField} from '@base-ui/react/field';

/** Текстовое поле ввода. `Field.Control`, чтобы подпись поля нашла его сама. */
export function Input(props: React.ComponentProps<typeof BaseField.Control>) {
  return <BaseField.Control {...props} className="a2ui-control a2ui-t--body" />;
}
