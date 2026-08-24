import React from 'react';
import {RecommendCard} from './recommend-card';
import {RecommendMore} from './recommend-more';
import type {RecommendLabels, RecommendVariant} from './recommend.types';

/**
 * Список вариантов: топ-`topCount` карточками, остальные — селектом. Разрез
 * считает блок, а не агент: сколько карточек влезает — вопрос вида, и решать
 * его должен тот, кто видит ширину.
 */
export function RecommendList({
  variants,
  labels,
}: {
  variants: RecommendVariant[];
  labels: RecommendLabels;
}) {
  const top = variants.slice(0, labels.topCount);
  const rest = variants.slice(labels.topCount);

  return (
    <>
      <div className="a2ui-recommend__cards">
        {top.map(variant => (
          <RecommendCard key={variant.id} variant={variant} applyLabel={labels.applyLabel} />
        ))}
      </div>
      <RecommendMore variants={rest} labels={labels} />
    </>
  );
}
