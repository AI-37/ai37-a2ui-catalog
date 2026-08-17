import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import {isEmptyLiftValue} from './is-empty-lift-value';
import type {CalcFieldValues} from './calc-editor.types';

/**
 * Строка-сводка свёрнутой секции: `{shortLabel ?? name} {значение}` по полям с
 * непустыми значениями, join « · ». Сводка собирается из живых значений, а не
 * приходит строкой от агента: присланная разъехалась бы после первой правки
 * (канон `buildLiftSectionSummary`).
 */
export function buildCalcSectionSummary(
  fields: readonly CalcEditorField[],
  values: CalcFieldValues,
): string {
  const parts: string[] = [];

  for (const field of fields) {
    const value = values[field.name];
    if (isEmptyLiftValue(value)) continue;

    parts.push(`${field.shortLabel ?? field.name} ${String(value)}`);
  }

  return parts.join(' · ');
}
