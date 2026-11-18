import {A2UI_DEFAULT_I18N, formatPlural, type A2uiI18n} from '../i18n';
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
export function buildReportInputsSummary(
  inputs: ReportNextInputs,
  {locale, messages}: A2uiI18n = A2UI_DEFAULT_I18N,
): string {
  let total = 0;
  let assumed = 0;

  for (const group of inputs.groups) {
    total += group.chips.length;

    if (group.tone === 'warning') {
      assumed += group.chips.length;
    }
  }

  const values = formatPlural(locale, messages.report.inputsCount, total);

  return assumed === 0
    ? values
    : `${values} · ${formatPlural(locale, messages.report.inputsAssumed, assumed)}`;
}
