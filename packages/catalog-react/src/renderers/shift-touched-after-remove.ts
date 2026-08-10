import {liftTouchedKey} from './lift-touched-key';

/**
 * Перенумерация пометок ручной правки после удаления лифта: индексы правее
 * сдвигаются влево, пометки удалённого исчезают. Иначе правка «переехала» бы
 * на соседний лифт вместе с перенумерацией вкладок.
 */
export function shiftTouchedAfterRemove(
  touched: ReadonlySet<string>,
  method: string,
  removedIndex: number,
): Set<string> {
  const next = new Set<string>();

  for (const key of touched) {
    const [keyMethod, keyIndex, ...rest] = key.split('|');
    if (keyMethod !== method) {
      next.add(key);
      continue;
    }

    const index = Number(keyIndex);
    if (index === removedIndex) continue;

    next.add(liftTouchedKey(method, index > removedIndex ? index - 1 : index, rest.join('|')));
  }

  return next;
}
