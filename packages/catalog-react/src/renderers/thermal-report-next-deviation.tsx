import React from 'react';
import {StatusPill} from '../primitives';
import {formatDeviationPct} from './format-deviation-pct';
import {useA2uiI18n} from '../i18n';

/**
 * Отклонение Rпр от Rнорм. Знак, запятая и тон считаются из числа, а не
 * приходят строкой: отрицательное — «не проходит», неотрицательное —
 * «проходит», и соседние поля на это не влияют.
 */
export function ThermalReportNextDeviation({pct}: {pct: number | undefined}) {
  const {locale} = useA2uiI18n();
  if (pct === undefined) {
    return null;
  }

  return (
    <StatusPill tone={pct < 0 ? 'fail' : 'pass'}>{formatDeviationPct(pct, locale)}</StatusPill>
  );
}
