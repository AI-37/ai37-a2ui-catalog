import React from 'react';
import {NumberField, Select} from '../primitives';
import type {KeoFieldControlProps} from './keo-next.types';

/**
 * Контрол поля по его типу. На экране КЕО типов два: число и список —
 * `text` и `boolean` схема допускает, но в наполнении их нет, и рисовать то,
 * чего не видели, набор не берётся (правило 4 метода `/proba`).
 *
 * Ветки разведены ранним `return`, а не тернарником в разметке.
 */
export function KeoNextFieldControl({field, value, onChange}: KeoFieldControlProps) {
  // `min`/`max` поля в контрол не уходят: границы предупреждают, а не
  // запрещают — зажатое поле не дало бы ввести спорное число, и подпись
  // «! проверить» стала бы недостижимой.
  if (field.type === 'number') {
    return (
      <NumberField
        name={field.name}
        value={typeof value === 'number' ? value : null}
        onValueChange={next => onChange(next)}
      />
    );
  }

  const text = value === undefined || value === null ? '' : String(value);

  return (
    <Select
      name={field.name}
      items={[...(field.options ?? [])]}
      value={text === '' ? null : text}
      onValueChange={next => onChange(next)}
      placeholder="—"
    />
  );
}
