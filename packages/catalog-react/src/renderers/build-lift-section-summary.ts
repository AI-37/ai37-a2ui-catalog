import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import {isEmptyLiftValue} from './is-empty-lift-value';
import type {LiftFieldValues} from './lift-editor.types';

/**
 * Строка-сводка свёрнутой секции или блока дефолтов: `{shortLabel ?? name}
 * {значение}` по полям с непустыми значениями, join « · ». Пустые значения
 * опускаются целиком. Сводка собирается из живых значений, а не приходит от
 * агента строкой — присланная разъехалась бы после первой правки (Решение 3
 * design lift-editor-sections-responsive).
 */
export function buildLiftSectionSummary(
  fields: readonly LiftEditorField[],
  values: LiftFieldValues,
): string {
  const parts: string[] = [];

  for (const field of fields) {
    const value = values[field.name];
    if (isEmptyLiftValue(value)) continue;

    parts.push(`${field.shortLabel ?? field.name} ${String(value)}`);
  }

  return parts.join(' · ');
}
