import React from 'react';
import {LiftNextRecommendCard} from './lift-next-recommend-card';
import type {LiftNextRecommendBlockProps} from './recommend.types';

/** Сколько вариантов показывать, когда наполнение молчит. */
const TOP_COUNT_DEFAULT = 2;

/**
 * Что показано в блоке по состоянию. `stale` рисует тот же список, что и
 * `shown`: приглушение вешает рама блока, чтобы список не знал о том, что он
 * устарел. `hidden` сюда не доходит — это отсутствие блока, а не его вид.
 *
 * Вариантов ровно `topCount` карточек и ничего кроме: списка выбора с
 * остальными у блока нет (design.md, Решение 11). Сколько вариантов стоит
 * предлагать — решает агент, отдавая их в нужном порядке.
 */
export function LiftNextRecommendBody({
  recommend,
  state,
  variants,
  onApply,
}: LiftNextRecommendBlockProps) {
  if (state === 'loading') {
    return <span className="a2ui-t--sub a2ui-t--muted">{recommend.loadingLabel}</span>;
  }

  if (state === 'empty') {
    return <span className="a2ui-t--sub a2ui-t--muted">{recommend.emptyLabel}</span>;
  }

  return (
    <div className="a2ui-recommend__cards">
      {variants.slice(0, recommend.topCount ?? TOP_COUNT_DEFAULT).map(variant => (
        <LiftNextRecommendCard
          key={variant.id}
          variant={variant}
          applyLabel={recommend.applyLabel}
          onApply={onApply}
        />
      ))}
    </div>
  );
}
