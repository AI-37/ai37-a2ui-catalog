import React from 'react';
import {Input, Select} from '../primitives';

/**
 * Назначение помещений: со списком от агента — `Select`, без него — ввод.
 * Пустой выбор остаётся доступным: `placeholder` показывает «—», пока
 * значения нет.
 */
export function ConstructionsNextBuildingTypeField({
  options,
  value,
  onChange,
}: {
  options: string[] | undefined;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  if (options === undefined || options.length === 0) {
    return (
      <Input value={value ?? ''} onChange={event => onChange(event.target.value || null)} />
    );
  }

  return <Select items={options} value={value} onValueChange={onChange} placeholder="—" />;
}
