import React from 'react';
import {Field, NumberField} from '../primitives';

/**
 * Температура помещения по конструкции (tв* или tот* формулы 5.3): пустое поле
 * означает «как у здания», и плейсхолдер показывает именно это значение из
 * блока «Условия». Дефолт в контроле не подставляется — иначе общая
 * температура уехала бы агенту как ввод по конструкции и подменила бы
 * провенанс (то же правило, что у поля r).
 *
 * Границ у контрола нет: температуры бывают любого знака, а осмысленность пары
 * проверяет агент.
 */
export function ConstructionsNextRoomTempField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: React.ReactNode;
  value: number | undefined;
  /** Значение здания: плейсхолдер пустого поля. Нет климата — плейсхолдера нет. */
  fallback: number | null;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <Field label={label}>
      <NumberField
        value={value ?? null}
        step={0.1}
        {...(fallback === null ? {} : {placeholder: String(fallback)})}
        onValueChange={next => onChange(next ?? undefined)}
      />
    </Field>
  );
}
