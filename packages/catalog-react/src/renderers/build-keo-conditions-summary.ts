import type {CalcCondition} from '@ai37/a2ui-catalog-schemas';
import type {KeoConditionsLive} from './keo-next.types';

/**
 * Сводка в шапке группы «Условия»: значение и то, что из него следует —
 * «Тюмень · группа светового климата 1 — C_N = 1,00…».
 *
 * Значение — живое, а не присланное: правка города и есть смысл «изменить
 * только для расчёта», и свёрнутая группа обязана показывать выбранное.
 * Следствие (`note` условия) нужно потому, что иначе связь «город → C_N» не
 * видна нигде; текст его приходит от агента — нормативных таблиц в компоненте
 * нет, группу по Прил. Е и C_N по табл. 5.1 СП 52 знает он.
 *
 * Поэтому у правленого условия следствие гаснет (Решение 5 design): агент
 * считал его по прежнему значению, и до нового снапшота props строка про
 * климат относилась бы не к тому городу. Молчание честнее неверной строки.
 */
export function buildKeoConditionsSummary(
  conditions: readonly CalcCondition[],
  live: KeoConditionsLive,
): string {
  return conditions
    .map(condition => {
      const value = live.conditionValue(condition.name);
      const note = live.isConditionEdited(condition.name) ? undefined : condition.note;

      return note === undefined ? value : `${value} · ${note}`;
    })
    .join(' · ');
}
