import type {LiftEditorDependentRule, LiftEditorFieldScope} from '@ai37/a2ui-catalog-schemas';
import {collectRuleTargets} from './collect-rule-targets';

/**
 * Поля, у которых изменение `field` снимает пометку ручной правки: цели всех
 * правил, где это поле — источник. Обобщение сегодняшнего «правка h/t123 живёт
 * до следующей смены Vн».
 */
export function findRuleTargetsBySource(
  rules: readonly LiftEditorDependentRule[],
  field: string,
  scope: LiftEditorFieldScope,
): string[] {
  const targets = new Set<string>();

  for (const rule of rules) {
    const isSource = rule.sources.some(
      source => source.field === field && (source.scope ?? 'lift') === scope,
    );
    if (!isSource) continue;

    for (const target of collectRuleTargets(rule)) {
      targets.add(target);
    }
  }

  return [...targets];
}
