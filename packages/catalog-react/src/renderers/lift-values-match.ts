/**
 * Сравнение значения поля со строкой таблицы `dependentRules`. Числа сравниваем
 * численно: ряд приходит как '1.6', а поле после авто-подстановки может нести
 * число 1.6 — строковое равенство здесь ложно отрицало бы совпадение. Запятая
 * как десятичный разделитель — обычный ввод в РФ.
 */
export function liftValuesMatch(expected: string | number, actual: unknown): boolean {
  if (actual === undefined || actual === null) return false;

  const expectedNumber = toNumber(expected);
  const actualNumber = toNumber(actual);
  if (expectedNumber !== null && actualNumber !== null) {
    return expectedNumber === actualNumber;
  }

  return String(expected).trim() === String(actual).trim();
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'boolean') return null;
  const parsed = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}
