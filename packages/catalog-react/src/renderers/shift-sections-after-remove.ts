import type {LiftSectionKey} from './lift-editor.types';

/**
 * Перенумерация ключей секций после удаления лифта: индексы правее сдвигаются
 * влево, ключ удалённого исчезает, `building` не трогается. Иначе раскрытие и
 * счёт просмотренного «переехали» бы на соседний лифт.
 */
export function shiftSectionsAfterRemove(
  sections: ReadonlySet<LiftSectionKey>,
  removedIndex: number,
): Set<LiftSectionKey> {
  const next = new Set<LiftSectionKey>();

  for (const key of sections) {
    if (key === 'building') {
      next.add(key);
      continue;
    }

    const index = Number(key.slice('lift-'.length));
    if (index === removedIndex) continue;

    next.add(index > removedIndex ? `lift-${index - 1}` : key);
  }

  return next;
}
