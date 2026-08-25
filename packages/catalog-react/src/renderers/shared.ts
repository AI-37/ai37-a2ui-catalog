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

/**
 * Общий стиль текстовых инпутов/селектов форм каталога.
 *
 * `width: 100%` и `border-box` — часть стиля, а не забота места вызова.
 * Сейчас оба вызова оборачивают контрол в grid, где `justify-self: stretch`
 * растягивает его сам, но стоит положить инпут в flex-строку рядом с соседом —
 * и он упрётся в него своей интринсик-шириной, а padding вылезет за колонку.
 */
export const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
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

/**
 * Псевдоним `inputStyle`. Раньше добавлял `width`/`box-sizing` поверх него —
 * теперь это в самом `inputStyle`, и копия оставлена только как алиас: две
 * почти одинаковые константы уже однажды разошлись, и место вызова взяло ту,
 * в которой правки не было.
 */
export const controlStyle: React.CSSProperties = inputStyle;

/** Кнопка коммита формы внутри карточки («Применить»/«Добавить»/«Сохранить»). */
export const commitButtonStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 10,
  border: 'none',
  background: tokens.accent,
  color: tokens.accentContrast,
  fontWeight: 600,
  cursor: 'pointer',
};

/** «Отмена» рядом с кнопкой коммита. */
export const cancelButtonStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 10,
  border: `1px solid ${tokens.borderStrong}`,
  background: 'transparent',
  color: tokens.text,
  cursor: 'pointer',
};

/** «Изменить» рядом с блоком в режиме чтения: неброская вторичная кнопка. */
export const editButtonStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 10,
  border: `1px solid ${tokens.borderSubtle}`,
  background: 'transparent',
  color: tokens.textMuted,
  fontSize: '0.85rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/**
 * Слоты многострочной опции lookup-дропдауна: group — надстрочный контекст,
 * мельче и приглушённее; meta — нижняя приглушённая строка. Кегли меньше
 * основного текста, чтобы высокая опция не съедала весь `maxHeight: 240`
 * попапа.
 */
export const lookupOptionGroupStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  color: tokens.textSubtle,
};

export const lookupOptionTitleStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.95rem',
  color: tokens.text,
};

export const lookupOptionMetaStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  color: tokens.textMuted,
};

/** Статус-строка попапа lookup («Ищем…» / «Ничего не найдено») — вне списка опций. */
export const lookupStatusStyle: React.CSSProperties = {
  display: 'block',
  padding: '6px 8px',
  fontSize: '0.85rem',
  color: tokens.textMuted,
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