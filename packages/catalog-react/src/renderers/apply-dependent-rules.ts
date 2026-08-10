import type {LiftEditorDependentRule} from '@ai37/a2ui-catalog-schemas';
import {collectRuleTargets} from './collect-rule-targets';
import {liftValuesMatch} from './lift-values-match';
import type {LiftFieldValues} from './lift-editor.types';

export interface ApplyDependentRulesParams {
  rules: readonly LiftEditorDependentRule[];
  /** Значения экрана здания — источники со `scope: 'building'`. */
  building: LiftFieldValues;
  lift: LiftFieldValues;
  /** Поле правил вручную, пока не изменился источник — авто-подстановка молчит. */
  isTouched: (field: string) => boolean;
}

/**
 * Зависимые значения одного лифта (Решение 7 design.md). Правило ищет строку,
 * чей `when` совпал со значениями `sources` В ПОРЯДКЕ ОБЪЯВЛЕНИЯ, и
 * перезаписывает поля из `set`. Нормативных таблиц ГОСТ здесь нет — только
 * присланные строки; правила применяются по порядку, поэтому следующее видит
 * записанное предыдущим.
 */
export function applyDependentRules({
  rules,
  building,
  lift,
  isTouched,
}: ApplyDependentRulesParams): LiftFieldValues {
  const next: LiftFieldValues = {...lift};

  for (const rule of rules) {
    const sourceValues = rule.sources.map(source =>
      source.scope === 'building' ? building[source.field] : next[source.field],
    );

    const row = rule.rows.find(candidate =>
      candidate.when.every((expected, index) => liftValuesMatch(expected, sourceValues[index])),
    );

    if (row) {
      for (const [field, value] of Object.entries(row.set)) {
        if (isTouched(field)) continue;
        next[field] = value;
      }
      continue;
    }

    // Вне таблицы: 'keep' (default) оставляет как есть — своя скорость просто
    // не трогает h/t123; 'clear' освобождает поле под ручной ввод.
    if (rule.onNoMatch !== 'clear') continue;

    for (const field of collectRuleTargets(rule)) {
      if (isTouched(field)) continue;
      next[field] = '';
    }
  }

  return next;
}
