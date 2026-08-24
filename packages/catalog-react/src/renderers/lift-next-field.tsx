import React from 'react';
import {Field} from '../primitives';
import {LiftNextFieldControl} from './lift-next-field-control';
import {LiftNextFieldNote} from './lift-next-field-note';
import type {LiftNextFieldProps} from './lift-next.types';

/** Поле экрана: подпись, контрол по типу поля и подпись под ним. */
export function LiftNextField({field, value, options, sources, onChange}: LiftNextFieldProps) {
  return (
    <Field label={field.label}>
      <LiftNextFieldControl field={field} value={value} options={options} onChange={onChange} />
      <LiftNextFieldNote source={sources[field.name]} hint={field.hint} />
    </Field>
  );
}
