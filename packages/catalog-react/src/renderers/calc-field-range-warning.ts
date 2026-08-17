import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';

/** Число русской записью: разделитель — запятая, как во всех подписях каталога. */
const decimal = (value: number) => String(value).replace('.', ',');

/**
 * Предупреждение о выходе числа за объявленный диапазон поля. Это единственный
 * текст предупреждения, который собирает клиент: границы приходят от агента, а
 * фраза — служебная (нормативных формулировок в компоненте нет — они в
 * `message` правил). Нарушение только подсвечивает поле, submit не блокирует.
 */
export function calcFieldRangeWarning(
  field: CalcEditorField,
  value: unknown,
): string | undefined {
  if (field.min === undefined && field.max === undefined) return undefined;
  if (value === undefined || value === null || value === '') return undefined;

  const numeric = Number(value);
  if (Number.isNaN(numeric)) return undefined;

  const belowMin = field.min !== undefined && numeric < field.min;
  const aboveMax = field.max !== undefined && numeric > field.max;
  if (!belowMin && !aboveMax) return undefined;

  if (field.min !== undefined && field.max !== undefined) {
    return `вне диапазона ${decimal(field.min)}…${decimal(field.max)}`;
  }

  return belowMin ? `меньше ${decimal(field.min!)}` : `больше ${decimal(field.max!)}`;
}
