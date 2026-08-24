import type React from 'react';

/** Форма кнопки: заливка / рамка / текстовая ссылка. */
export type ButtonVariant = 'filled' | 'outline' | 'link';

/** Кегль и отступы. `md` — метрики нынешнего `a2ui-ce-btn`; кегль приходит со ступени шкалы. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Смысловая окраска. `neutral` — тексто-цветная, как сегодня у CE. */
export type ButtonTone = 'neutral' | 'accent' | 'danger';

/** Оси кнопки без своего элемента: то, из чего собирается класс. */
export interface ButtonClassOptions {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  tone?: ButtonTone | undefined;
  /** Пунктирная рамка — единственный «жанр» CE, не сводимый к variant (`+ Добавить`). */
  dashed?: boolean | undefined;
  /** Квадратная кнопка без подписи: считает вызывающий, потому что children тут нет. */
  iconOnly?: boolean | undefined;
  /** Классы раскладки от хоста: примитив красит, а место ему даёт родитель. */
  className?: string | undefined;
}

export interface ButtonProps extends Omit<ButtonClassOptions, 'iconOnly'> {
  /** Иконка слева от подписи; без `children` кнопка становится квадратной icon-only. */
  icon?: React.ReactNode;
  /** Доступное имя для icon-only: без подписи скринридеру не за что зацепиться. */
  'aria-label'?: string;
  disabled?: boolean;
  onClick?: () => void;
  /** Раскрытие: пробрасывается в aria-expanded кнопки-раскрывашки. */
  'aria-expanded'?: boolean;
  children?: React.ReactNode;
}
