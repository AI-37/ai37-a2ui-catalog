import type React from 'react';

/**
 * Тон поверхности карточки. `auto` — уровень берётся из вложенности: верхняя
 * карточка светлая, вложенная — утопленная. Явный тон нужен там, где порядок
 * вложения не совпадает с нужной глубиной.
 */
export type CardTone = 'auto' | 'surface' | 'sunken' | 'plain';

/** Оси карточки без своего элемента: то, из чего собирается класс. */
export interface CardClassOptions {
  tone?: CardTone | undefined;
  /** Без рамки — строка-раскрывашка внутри группы. */
  flat?: boolean | undefined;
  /** Рамка тревоги: карточка не проходит проверку. */
  invalid?: boolean | undefined;
  /** Классы раскладки от хоста. */
  className?: string | undefined;
}

export interface CardProps extends CardClassOptions {
  /** Вся карточка кликабельна: рендерится кнопкой, а не секцией. */
  onClick?: (() => void) | undefined;
  children?: React.ReactNode;
}

export interface CardHeaderProps {
  /** Заголовок: обычный текст или готовая кнопка-раскрывашка библиотеки. */
  title: React.ReactNode;
  /** Состояние строкой: точка + слово. */
  status?: React.ReactNode;
  /** Числовая пометка справа от статуса. */
  badge?: React.ReactNode;
  /** Действие в правом краю — обычно icon-only кнопка. */
  action?: React.ReactNode;
}
