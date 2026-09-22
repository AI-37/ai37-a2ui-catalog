import type {ConstructionEntry} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionHeaderFields} from './constructions-editor.types';

/**
 * Коммит формы шапки поверх конструкции. Очищенное поле (r, tв*, tот*)
 * снимается с конструкции ключом, а не остаётся `undefined`-значением:
 * payload submit/черновика равен состоянию, и «стереть значение» должно
 * означать «не задано», а не «ключ есть, значения нет».
 */
export function withHeaderFields(
  entry: ConstructionEntry,
  fields: ConstructionHeaderFields,
): ConstructionEntry {
  const next = {...entry, ...fields};
  if (next.r === undefined) {
    delete next.r;
  }
  if (next.tvRoom === undefined) {
    delete next.tvRoom;
  }
  if (next.totRoom === undefined) {
    delete next.totRoom;
  }
  return next;
}
