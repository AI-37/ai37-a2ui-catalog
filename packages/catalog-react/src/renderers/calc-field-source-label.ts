import type {CalcFieldSourceKind} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, type A2uiMessages} from '../i18n';

/**
 * Названия видов источника словами — подписи полей расчётных редакторов (КЕО,
 * инсоляция). Свой словарь (`calcSource`), а не констракшновый `fieldSourceLabel`:
 * у расчётных модулей два дополнительных вида — «рассчитано» (значение посчитал
 * агент) и «допущение» (значение принято без данных проекта).
 */
export function calcFieldSourceLabel(
  kind: CalcFieldSourceKind,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  return messages.calcSource[kind];
}
