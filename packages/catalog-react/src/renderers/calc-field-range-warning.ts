import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import {A2UI_DEFAULT_I18N, formatDecimal, formatMessage, type A2uiI18n} from '../i18n';

/**
 * Предупреждение о выходе числа за объявленный диапазон поля. Это единственный
 * текст предупреждения, который собирает клиент: границы приходят от агента, а
 * фраза — служебная (нормативных формулировок в компоненте нет — они в
 * `message` правил). Нарушение только подсвечивает поле, submit не блокирует.
 * Границы пишутся по локали: по-русски через запятую, по-английски через точку.
 */
export function calcFieldRangeWarning(
  field: CalcEditorField,
  value: unknown,
  {locale, messages}: A2uiI18n = A2UI_DEFAULT_I18N,
): string | undefined {
  if (field.min === undefined && field.max === undefined) return undefined;
  if (value === undefined || value === null || value === '') return undefined;

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return undefined;

  const belowMin = field.min !== undefined && numeric < field.min;
  const aboveMax = field.max !== undefined && numeric > field.max;
  if (!belowMin && !aboveMax) return undefined;

  const decimal = (bound: number) => formatDecimal(locale, bound, {max: 20});
  const m = messages.common;

  if (field.min !== undefined && field.max !== undefined) {
    return formatMessage(m.outOfRange, {min: decimal(field.min), max: decimal(field.max)});
  }

  return belowMin
    ? formatMessage(m.belowMin, {min: decimal(field.min!)})
    : formatMessage(m.aboveMax, {max: decimal(field.max!)});
}
