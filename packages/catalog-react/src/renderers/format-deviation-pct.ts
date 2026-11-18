import {A2UI_DEFAULT_LOCALE, formatDecimal} from '../i18n';

/**
 * Чип отклонения: «−23,3 %» / «+0,6 %» — явный знак (типографский минус,
 * как в макете), один знак после разделителя локали. Единственное число в
 * props ThermalReport — остальное агент присылает готовыми строками.
 */
export function formatDeviationPct(pct: number, locale: string = A2UI_DEFAULT_LOCALE): string {
  const abs = formatDecimal(locale, Math.abs(pct), {min: 1, max: 1});

  return `${pct < 0 ? '−' : '+'}${abs} %`;
}
