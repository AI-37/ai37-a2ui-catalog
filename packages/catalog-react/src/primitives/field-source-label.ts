import type {CalcFieldSourceKind, ConstructionsFieldSourceKind} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, type A2uiMessages} from '../i18n';

/**
 * Вид источника, который знает набор: четыре вида редакторов состава
 * (`ConstructionsEditor`, `LiftEditor`) плюс два расчётных — `calculated`
 * (значение посчитал агент) и `assumption` (принято без данных проекта).
 *
 * Это ОДИН словарь с шестью видами, а не два примитива: разметка, тон и
 * правило акцента у подписи те же, различается только слово (Решение 6 design
 * `proba-keo-assembly`).
 */
export type KitFieldSourceKind = ConstructionsFieldSourceKind | CalcFieldSourceKind;

/**
 * Название источника словами — подпись поля, у которого нет `note`. Общий
 * словарь провенанса каталога: им пользуются и `ConstructionsEditor`, и
 * `LiftEditor` (схема источника у них одна — `liftEditorFieldSourceSchema`
 * переиспользует констракшновскую), и расчётные редакторы (КЕО, инсоляция).
 * Слова — из словаря подписей (`fieldSource`), по умолчанию русские.
 */
export function fieldSourceLabel(
  source: KitFieldSourceKind,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  return messages.fieldSource[source];
}
