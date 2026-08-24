import React from 'react';
import type {ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';
import {Select} from '../primitives';

/** Условия эксплуатации по СП 50: два значения, третьего не бывает. */
const CONDITIONS = ['А', 'Б'];

/**
 * Выбор λА/λБ. Отдельным компонентом ради приведения типа: `Select` работает
 * со строками, а схема знает только «А» и «Б».
 */
export function ConstructionsNextConditionField({
  value,
  onChange,
}: {
  value: ConstructionsGeneral['condition'];
  onChange: (value: ConstructionsGeneral['condition']) => void;
}) {
  return (
    <Select
      items={CONDITIONS}
      value={value}
      placeholder="—"
      onValueChange={next => onChange(next as ConstructionsGeneral['condition'])}
    />
  );
}
