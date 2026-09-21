import type {ConstructionEntry} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionHeaderFields} from './constructions-editor.types';

/**
 * Коммит формы шапки поверх конструкции. Очищенное поле r снимается с
 * конструкции ключом, а не остаётся `undefined`-значением: payload
 * submit/черновика равен состоянию, и «стереть r» должно означать «r не
 * задан», а не «ключ есть, значения нет».
 */
export function withHeaderFields(
  entry: ConstructionEntry,
  fields: ConstructionHeaderFields,
): ConstructionEntry {
  const next = {...entry, ...fields};
  if (next.r === undefined) {
    delete next.r;
  }
  return next;
}
