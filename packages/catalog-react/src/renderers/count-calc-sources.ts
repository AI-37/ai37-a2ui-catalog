import type {CalcSourceCounts, CalcSourceItem} from './calc-editor.types';

/**
 * Счётчик источников значений по отрисованным полям. Правленное поле уходит в
 * `edited` независимо от того, какой источник у него был: подпись под контролом
 * и футер обязаны говорить одно и то же.
 */
export function countCalcSources(items: readonly CalcSourceItem[]): CalcSourceCounts {
  const counts: CalcSourceCounts = {};

  for (const item of items) {
    if (item.edited) {
      counts.edited = (counts.edited ?? 0) + 1;
      continue;
    }

    if (item.source === undefined) continue;

    counts[item.source.source] = (counts[item.source.source] ?? 0) + 1;
  }

  return counts;
}
