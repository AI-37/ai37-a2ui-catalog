import type {KeoValidationRule} from '@ai37/a2ui-catalog-schemas';
import {sumCalcValues} from './sum-calc-values';
import type {CalcFieldValues} from './calc-editor.types';

/**
 * Предупреждения по правилам из props: имя поля → тексты «! проверить».
 * Клиент только считает объявленное (отношение сумм или сумму против границы) —
 * ни нормативных значений, ни формулировок он не знает, всё приходит в правиле.
 * Нарушение подсвечивает поля из `targets` и никогда не блокирует submit
 * (Решение 5 design.md).
 */
export function evaluateKeoRules(
  rules: readonly KeoValidationRule[],
  values: CalcFieldValues,
): Map<string, string[]> {
  const warnings = new Map<string, string[]>();

  for (const rule of rules) {
    const over = sumCalcValues(rule.over, values);
    if (over === undefined) continue;

    let violated = false;

    if (rule.kind === 'ratio-max') {
      const under = sumCalcValues(rule.under ?? [], values);
      if (under === undefined || under === 0 || rule.limit === undefined) continue;
      violated = over / under > rule.limit;
    } else {
      const limit =
        rule.limitField === undefined ? rule.limit : sumCalcValues([rule.limitField], values);
      if (limit === undefined) continue;
      violated = over > limit;
    }

    if (!violated) continue;

    for (const target of rule.targets) {
      warnings.set(target, [...(warnings.get(target) ?? []), rule.message]);
    }
  }

  return warnings;
}
