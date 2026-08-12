import type {ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';

/**
 * Сводка свёрнутого блока условий: «Москва · климат по СП 131 · tв +20 °C ·
 * условия Б». Собирается из текущих значений, а не приходит от агента строкой:
 * присланный текст разъехался бы с полями после первой правки (Решение 6
 * design.md).
 *
 * Незаполненные значения опускаются — пустой фрагмент («город: —») в сводке
 * шумит и ничего не сообщает. «Климат по СП 131» появляется, только когда
 * заполнена вся тройка tот/zот/tн: в компоненте она приходит из справочника
 * городов СП 131 либо правится руками поверх него.
 */
export function buildConditionsSummary(general: ConstructionsGeneral): string {
  const parts: string[] = [];

  if (general.city?.label) parts.push(general.city.label);
  if (general.tot !== null && general.zot !== null && general.tn !== null) {
    parts.push('климат по СП 131');
  }
  if (general.tv !== null) parts.push(`tв ${general.tv > 0 ? '+' : ''}${general.tv} °C`);
  if (general.condition !== null) parts.push(`условия ${general.condition}`);

  return parts.join(' · ');
}
