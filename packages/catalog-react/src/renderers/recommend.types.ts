import type {LiftEditorRecommend, RecommendResourceVariant} from '@ai37/a2ui-catalog-schemas';

/**
 * Состояние блока подбора. `hidden` — блока нет вовсе: не все обязательные
 * поля заполнены либо канал сломан. `stale` — значения изменились, прежний
 * список показывается приглушённым, чтобы блок не прыгал под курсором.
 */
export type RecommendState = 'hidden' | 'loading' | 'shown' | 'empty' | 'stale';

export interface UseRecommendVariants {
  state: RecommendState;
  /** Последний удачный список; в `stale` он от предыдущего ввода. */
  variants: RecommendResourceVariant[];
}

/** Собранный запрос подбора и ключ, по которому судят об актуальности ответа. */
export interface RecommendQuery {
  params: URLSearchParams;
  /** Сериализация значений `params` — ответ на другой ключ не отрисовывается. */
  key: string;
}

/** Что делает применение варианта: получатель у экрана один — control. */
export type OnApplyRecommendation = (variant: RecommendResourceVariant) => void;

export interface LiftNextRecommendBlockProps {
  recommend: LiftEditorRecommend;
  state: RecommendState;
  variants: RecommendResourceVariant[];
  onApply: OnApplyRecommendation;
}

export interface LiftNextRecommendCardProps {
  variant: RecommendResourceVariant;
  applyLabel: string;
  onApply: OnApplyRecommendation;
}
