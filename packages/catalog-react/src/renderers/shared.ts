/**
 * Точка расширения для базовых стилей/темы рендереров.
 *
 * Цвета заданы через CSS-переменные `--a2ui-*` с fallback'ами (см. `./tokens`),
 * поэтому дефолтная тема работает без какой-либо инъекции, а кастомная тема
 * подключается переопределением этих переменных на родителе. Хук оставлен как
 * место для будущих side-эффектов (например, инъекции `defaultThemeCss`).
 */
import type React from 'react';
import {tokens} from './tokens';

export function useA2uiBaseStyles() {
  return undefined;
}

/** Общий стиль текстовых инпутов/селектов форм каталога. */
export const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 10,
  border: `1px solid ${tokens.borderStrong}`,
  fontSize: '0.95rem',
  background: tokens.surface,
  color: tokens.text,
};

/** Ширина колонки полей: анкета читается лучше узкой, чем во всю карточку. */
export const FIELD_COLUMN_WIDTH = 420;

/** Поле формы в столбик: подпись над контролом. */
export const fieldStyle: React.CSSProperties = {display: 'grid', gap: 4};

/** Подпись поля формы. */
export const fieldLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: tokens.textMuted,
};

// border-box: иначе padding инпута вылезает за колонку.
export const controlStyle: React.CSSProperties = {
  ...inputStyle,
  width: '100%',
  boxSizing: 'border-box',
};

export function toDisplayValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

export function mapAlign(value?: 'start' | 'center' | 'end') {
  switch (value) {
    case 'center':
      return 'center';
    case 'end':
      return 'right';
    default:
      return 'left';
  }
}