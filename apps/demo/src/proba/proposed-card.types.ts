import type React from 'react';

/**
 * Тон поверхности карточки. `auto` — уровень берётся из вложенности: верхняя
 * карточка светлая, вложенная — утопленная. Явный тон нужен там, где порядок
 * вложения не совпадает с нужной глубиной.
 */
export type CardTone = 'auto' | 'surface' | 'sunken' | 'plain';

export interface CardProps {
  tone?: CardTone;
  /** Без рамки — строка-раскрывашка внутри группы. */
  flat?: boolean;
  /** Рамка тревоги: карточка не проходит проверку. */
  invalid?: boolean;
  /** Вся карточка кликабельна: рендерится кнопкой, а не секцией. */
  onClick?: () => void;
  children?: React.ReactNode;
}

export interface CardHeaderProps {
  title: React.ReactNode;
  /** Состояние строкой: точка + слово. */
  status?: React.ReactNode;
  /** Числовая пометка справа от статуса. */
  badge?: React.ReactNode;
  /** Действие в правом краю — обычно icon-only кнопка. */
  action?: React.ReactNode;
  /** Есть раскрытие: слева появляется шеврон, заголовок становится кнопкой. */
  open?: boolean;
  onToggle?: () => void;
}

export interface CardTitleProps {
  title: React.ReactNode;
  open: boolean | undefined;
  onToggle: (() => void) | undefined;
}
