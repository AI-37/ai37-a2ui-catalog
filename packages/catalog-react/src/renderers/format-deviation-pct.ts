/**
 * Чип отклонения: «−23,3 %» / «+0,6 %» — явный знак (типографский минус,
 * как в макете), десятичная запятая, один знак после запятой. Единственное
 * число в props ThermalReport — остальное агент присылает готовыми строками.
 */
export function formatDeviationPct(pct: number): string {
  const abs = Math.abs(pct).toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return `${pct < 0 ? '−' : '+'}${abs} %`;
}
