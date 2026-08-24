import type React from 'react';
/** Форма кнопки: заливка / рамка / текстовая ссылка. */
export type ButtonVariant = 'filled' | 'outline' | 'link';

/** Кегль и отступы. `md` — метрики нынешнего `a2ui-ce-btn` (8/14 · 13px). */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Смысловая окраска. `neutral` — тексто-цветная, как сегодня у CE. */
export type ButtonTone = 'neutral' | 'accent' | 'danger';

export interface ProposedButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  /** Пунктирная рамка — единственный «жанр» CE, не сводимый к variant (`+ Добавить`). */
  dashed?: boolean;
  /** Иконка слева от подписи; без `children` кнопка становится квадратной icon-only. */
  icon?: React.ReactNode;
  /** Доступное имя для icon-only: без подписи скринридеру не за что зацепиться. */
  'aria-label'?: string;
  disabled?: boolean;
  onClick?: () => void;
  /** Раскрытие: пробрасывается в aria-expanded кнопки-раскрывашки. */
  'aria-expanded'?: boolean;
  /** Классы раскладки от хоста: примитив красит, а место ему даёт родитель. */
  className?: string;
  children?: React.ReactNode;
}
