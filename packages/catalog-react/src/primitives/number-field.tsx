import React from 'react';
import {NumberField as BaseNumberField} from '@base-ui/react/number-field';
import type {NumberFieldProps} from './number-field.types';

/**
 * Числовое поле на Base UI NumberField. Кнопок-ступеней у него нет намеренно:
 * в форме условий четыре числовых поля подряд, и восемь квадратов рядом с
 * ними читаются как панель, а не как значения. Шаг остаётся на `↑`/`↓`.
 *
 * `locale="ru-RU"`: запятая — десятичный разделитель, как в остальном экране;
 * точку разбор тоже принимает. Наружу уходит `number | null` — состояние формы
 * держит число, а не строку поля.
 */
export function NumberField({
  value,
  onValueChange,
  step,
  min,
  compact,
  disabled,
  name,
  'aria-label': ariaLabel,
}: NumberFieldProps) {
  return (
    <BaseNumberField.Root
      value={value}
      onValueChange={onValueChange}
      step={step}
      min={min}
      disabled={disabled}
      name={name}
      locale="ru-RU"
    >
      <BaseNumberField.Input
        className={`a2ui-control a2ui-t--body${compact ? ' a2ui-control--compact' : ''}`}
        aria-label={ariaLabel}
      />
    </BaseNumberField.Root>
  );
}
