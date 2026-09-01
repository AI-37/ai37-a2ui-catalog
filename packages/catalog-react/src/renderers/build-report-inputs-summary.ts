import {pluralRu} from './plural-ru';
import type {ReportNextInputs} from './report-next.types';

/**
 * Сводка свёрнутой карточки «Исходные данные»: сколько значений и сколько из
 * них принято системой. Второе число — то, ради чего карточку и открывают
 * (группа тона `warning` — «проверьте»), поэтому оно обязано быть видно
 * свёрнутым.
 *
 * Собирается из живых props, а не приходит от агента: присланная строка
 * разошлась бы с содержимым при первой же правке наполнения.
 */
export function buildReportInputsSummary(inputs: ReportNextInputs): string {
  let total = 0;
  let assumed = 0;

  for (const group of inputs.groups) {
    total += group.chips.length;

    if (group.tone === 'warning') {
      assumed += group.chips.length;
    }
  }

  const values = `${total} ${pluralRu(total, 'значение', 'значения', 'значений')}`;

  return assumed === 0
    ? values
    : `${values} · ${assumed} ${pluralRu(assumed, 'принято', 'приняты', 'приняты')} системой`;
}
