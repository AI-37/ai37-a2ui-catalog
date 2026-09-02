import {formatNum} from './format-num';
import type {KeoDrawings} from '@ai37/a2ui-catalog-schemas';

/**
 * Краткая строка свёрнутого фолда: что внутри, видно без клика. Перекрытое
 * небо говорит об этом словами — n₁ там нет вовсе.
 */
export function buildDrawingsSummary(drawings: KeoDrawings): string {
  const counts: string[] = [];

  if (drawings.section.skyVisible && drawings.section.n1 !== undefined) {
    counts.push(`n₁ = ${formatNum(drawings.section.n1)}`);
  } else if (!drawings.section.skyVisible) {
    counts.push('небо из РТ не видно');
  }

  if (drawings.plan.n2 !== undefined) {
    counts.push(`n₂ = ${formatNum(drawings.plan.n2)}`);
  }

  const head = 'Разрез и план · график Данилюка I/II';

  return counts.length === 0 ? head : `${head} · ${counts.join(', ')}`;
}
