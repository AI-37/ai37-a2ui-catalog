/**
 * Механика прохода, общая для `KeoEditorNext` и `LiftEditorNext`: якоря целей
 * и перевод каретки в раскрытую цель.
 */
export interface WalkthroughFocus<Key extends string> {
  /** Якорь цели: ref на карточку секции, по нему ищется её панель. */
  bindSection: (key: Key) => (node: HTMLElement | null) => void;
  /** Узел цели — для прокрутки к ней там, где она предусмотрена. */
  nodeFor: (key: Key) => HTMLElement | null;
  /**
   * Назначить цель шага. Фокус переедет туда СЛЕДУЮЩИМ рендером: в момент
   * клика панель цели ещё скрыта (Решение 3 design `next-walkthrough-focus`).
   */
  aimAt: (key: Key) => void;
}
