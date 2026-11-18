/**
 * Строка с числом в нескольких формах — по категориям `Intl.PluralRules`.
 * Обязательна только `other`: в английском хватает `one` и `other`, русскому
 * нужны ещё `few` и `many`. Категории, которой нет в словаре, достаётся `other`.
 */
export interface PluralMessage {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}
