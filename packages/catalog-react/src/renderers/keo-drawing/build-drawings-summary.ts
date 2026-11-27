import {A2UI_DEFAULT_I18N, type A2uiI18n} from '../../i18n';
import {formatNum} from './format-num';
import type {KeoDrawings} from '@ai37/a2ui-catalog-schemas';

/**
 * Краткая строка свёрнутого фолда: что внутри, видно без клика. Перекрытое
 * небо говорит об этом словами — n₁ там нет вовсе.
 */
export function buildDrawingsSummary(
  drawings: KeoDrawings,
  {locale, messages}: A2uiI18n = A2UI_DEFAULT_I18N,
): string {
  const counts: string[] = [];

  if (drawings.section.skyVisible && drawings.section.n1 !== undefined) {
    counts.push(`n₁ = ${formatNum(drawings.section.n1, 1, locale)}`);
  } else if (!drawings.section.skyVisible) {
    counts.push(messages.keo.skyBlocked);
  }

  if (drawings.plan.n2 !== undefined) {
    counts.push(`n₂ = ${formatNum(drawings.plan.n2, 1, locale)}`);
  }

  const head = messages.keo.drawingsSummary;

  return counts.length === 0 ? head : `${head} · ${counts.join(', ')}`;
}
