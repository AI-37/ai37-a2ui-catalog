import React from 'react';
import {formatDeviationPct} from '../../../../packages/catalog-react/src/renderers/format-deviation-pct';
import {StatusPill} from './status-pill';

/**
 * Отклонение Rпр от Rнорм. Знак, запятая и тон считаются из числа, а не
 * приходят строкой: отрицательное — «не проходит», неотрицательное —
 * «проходит», и соседние поля на это не влияют.
 */
export function DeviationChip({pct}: {pct: number | undefined}) {
  if (pct === undefined) {
    return null;
  }

  return <StatusPill tone={pct < 0 ? 'fail' : 'pass'}>{formatDeviationPct(pct)}</StatusPill>;
}
