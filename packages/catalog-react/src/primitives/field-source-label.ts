import type {CalcFieldSourceKind, ConstructionsFieldSourceKind} from '@ai37/a2ui-catalog-schemas';

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
 */
const LABELS: Record<KitFieldSourceKind, string> = {
  project: 'из проекта',
  question: 'из вопроса',
  suggested: 'предложено агентом',
  default: 'принято по умолчанию',
  calculated: 'рассчитано',
  assumption: 'допущение',
};

export function fieldSourceLabel(source: KitFieldSourceKind): string {
  return LABELS[source];
}
