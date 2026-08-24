import React from 'react';
import {Chip} from '../primitives';

/**
 * Чип live-Rпр: значение и сравнение с Rнорм (зелёный ≥ / красный &lt;). Без
 * `rnorm` сравнение не показывается — климат тронут либо норма типу не задана;
 * без вычислимого Rпр значение — «—».
 */
export function ConstructionsNextRprChip({
  rpr,
  rnorm,
}: {
  rpr: number | null;
  rnorm: number | undefined;
}) {
  const comparable = rpr !== null && rnorm !== undefined;
  const passes = comparable && rpr >= rnorm;

  return (
    <Chip tone={!comparable ? 'neutral' : passes ? 'success' : 'danger'}>
      Rпр {rpr === null ? '—' : rpr.toFixed(2)}
      {comparable ? ` ${passes ? '≥' : '<'} ${rnorm.toFixed(2)}` : ''}
    </Chip>
  );
}
