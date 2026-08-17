import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import type {CalcFieldValues} from './calc-editor.types';

/**
 * Видно ли поле при текущих значениях экрана: без `revealBy` — всегда, иначе
 * значение поля-триггера должно попасть в объявленный список (ветка затенения
 * схемы N1). Скрытое поле не рендерится и не участвует ни в счётчике
 * источников, ни в предупреждениях, но своё значение в документе сохраняет —
 * возврат триггера показывает введённое.
 */
export function isRevealedField(field: CalcEditorField, values: CalcFieldValues): boolean {
  if (field.revealBy === undefined) return true;

  const trigger = values[field.revealBy.field];

  return field.revealBy.values.includes(String(trigger ?? ''));
}
