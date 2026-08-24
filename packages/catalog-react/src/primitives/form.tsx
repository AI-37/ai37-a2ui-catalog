import React from 'react';
import type {FormProps} from './form.types';

/** Классы сетки по числу колонок: одна колонка — базовое состояние без модификатора. */
const COLUMNS: Record<1 | 2 | 3, string> = {
  1: '',
  2: ' a2ui-form--two',
  3: ' a2ui-form--three',
};

/**
 * Сетка полей. Контейнер раскладки — корень набора (`.a2ui-kit`), поэтому
 * своей обёртки форме не нужно: она просто растягивается по месту, которое ей
 * дал родитель, а число колонок решает ширина корня.
 */
export function Form({columns = 1, children}: FormProps) {
  return <div className={`a2ui-form${COLUMNS[columns]}`}>{children}</div>;
}
