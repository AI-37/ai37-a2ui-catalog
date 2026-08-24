import React from 'react';
import {Combo, NumberField, Select} from '../primitives';
import type {LiftNextFieldControlProps} from './lift-next.types';

/**
 * Контрол одного поля по его типу. Типов на этом экране три: число, список и
 * `combo` — свободный ввод с рядом-подсказкой. Ветки разведены ранними
 * `return`, а не тернарником в разметке.
 */
export function LiftNextFieldControl({
  field,
  value,
  options,
  onChange,
}: LiftNextFieldControlProps) {
  if (field.type === 'number') {
    return (
      <NumberField
        name={field.name}
        value={typeof value === 'number' ? value : null}
        onValueChange={next => onChange(field.name, next)}
      />
    );
  }

  const text = value === undefined || value === null ? '' : String(value);

  if (field.type === 'select') {
    return (
      <Select
        name={field.name}
        items={options.map(option => option.value)}
        value={text === '' ? null : text}
        onValueChange={next => onChange(field.name, next)}
        placeholder="—"
      />
    );
  }

  return (
    <Combo
      name={field.name}
      options={options}
      value={text}
      onValueChange={next => onChange(field.name, next)}
    />
  );
}
