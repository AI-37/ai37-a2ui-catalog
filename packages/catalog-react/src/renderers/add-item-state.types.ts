/**
 * Состояние кнопки добавления элемента в списке с пределом:
 * `available` — можно добавить; `disabled` — предел достигнут, но освободится
 * удалением; `hidden` — предел недостижим, кнопки на экране нет.
 */
export type AddItemState = 'available' | 'disabled' | 'hidden';

export interface AddItemStateInput {
  /** Сколько элементов в списке сейчас. */
  count: number;
  /** Верхний предел из props агента; `undefined` — предела нет. */
  max: number | undefined;
  /** Нижняя граница списка: столько элементов удалить уже нельзя. */
  minCount: number;
}
