import type {LiftEditorDependentRule} from '@ai37/a2ui-catalog-schemas';

/**
 * Поля, которыми правило распоряжается: объединение ключей `set` всех строк.
 * Нужны и для `onNoMatch: 'clear'` (что чистить), и для снятия пометки ручной
 * правки при смене источника.
 */
export function collectRuleTargets(rule: LiftEditorDependentRule): string[] {
  const targets = new Set<string>();

  for (const row of rule.rows) {
    for (const field of Object.keys(row.set)) {
      targets.add(field);
    }
  }

  return [...targets];
}
