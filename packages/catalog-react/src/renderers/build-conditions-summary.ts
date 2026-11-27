import type {ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, formatMessage, type A2uiMessages} from '../i18n';

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
export function buildConditionsSummary(
  general: ConstructionsGeneral,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  const m = messages.constructions;
  const parts: string[] = [];

  if (general.city?.label) parts.push(general.city.label);
  if (general.tot !== null && general.zot !== null && general.tn !== null) {
    parts.push(m.summaryClimate);
  }
  if (general.tv !== null) {
    parts.push(formatMessage(m.summaryTv, {value: `${general.tv > 0 ? '+' : ''}${general.tv}`}));
  }
  if (general.condition !== null) {
    parts.push(formatMessage(m.summaryCondition, {value: general.condition}));
  }

  return parts.join(' · ');
}
