import type {CalcFieldValues} from './calc-editor.types';

/**
 * Сумма числовых значений перечисленных полей. `undefined` — хотя бы одно поле
 * пусто или не число: правило по неполным данным не считается (незаполненное
 * поле подсвечивает обязательность, а не «неверную геометрию»).
 */
export function sumCalcValues(
  names: readonly string[],
  values: CalcFieldValues,
): number | undefined {
  let total = 0;

  for (const name of names) {
    const raw = values[name];
    if (raw === undefined || raw === null || raw === '') return undefined;

    const numeric = Number(raw);
    if (Number.isNaN(numeric)) return undefined;

    total += numeric;
  }

  return total;
}
