/**
 * Точка расширения для базовых стилей/темы рендереров.
 *
 * Цвета заданы через CSS-переменные `--a2ui-*` с fallback'ами (см. `./tokens`),
 * поэтому дефолтная тема работает без какой-либо инъекции, а кастомная тема
 * подключается переопределением этих переменных на родителе. Хук оставлен как
 * место для будущих side-эффектов (например, инъекции `defaultThemeCss`).
 */
export function useA2uiBaseStyles() {
  return undefined;
}

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