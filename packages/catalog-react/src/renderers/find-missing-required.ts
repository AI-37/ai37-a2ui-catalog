import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import {isEmptyLiftValue} from './is-empty-lift-value';
import type {LiftFieldValues} from './lift-editor.types';

/**
 * Незаполненные обязательные поля экрана. Единственная клиентская проверка:
 * нормативные диапазоны и ряды судит агент (Решение 12 design.md).
 */
export function findMissingRequired(
  fields: readonly LiftEditorField[],
  values: LiftFieldValues,
): string[] {
  return fields
    .filter(field => field.required && isEmptyLiftValue(values[field.name]))
    .map(field => field.name);
}
