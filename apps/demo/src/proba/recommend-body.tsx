import React from 'react';
import {RecommendList} from './recommend-list';
import type {RecommendLabels, RecommendState, RecommendVariant} from './recommend.types';

/**
 * Что показано в блоке по состоянию. `stale` рисует тот же список, что и
 * `shown`, — приглушение вешает рама блока, чтобы список не знал о том, что
 * он устарел, а `hidden` сюда не доходит: это отсутствие блока, а не его вид.
 */
export function RecommendBody({
  state,
  variants,
  labels,
}: {
  state: RecommendState;
  variants: RecommendVariant[];
  labels: RecommendLabels;
}) {
  if (state === 'loading') {
    return <span className="a2ui-t--sub a2ui-t--muted">{labels.loadingLabel}</span>;
  }

  if (state === 'empty') {
    return <span className="a2ui-t--sub a2ui-t--muted">{labels.emptyLabel}</span>;
  }

  return <RecommendList variants={variants} labels={labels} />;
}
