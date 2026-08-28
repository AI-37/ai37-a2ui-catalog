import {keoRoomLabels} from './keo-room-labels';
import type {KeoDocument, KeoRoomDraft} from './keo-next.types';

/**
 * Документ экрана: живые условия и все помещения. Формат один на submit и на
 * черновик (Решение 4 design `keo-editor-draft`): два формата на одни и те же
 * данные разъехались бы, и разбирать их агенту пришлось бы дважды.
 *
 * Черновик допустимо дырявый — пустое помещение и незаполненные условия здесь
 * не ошибка, поэтому ничего не отсеивается и не нормализуется.
 */
export function buildKeoDocument(
  conditions: Record<string, string>,
  rooms: readonly KeoRoomDraft[],
  roomLabel: string,
): KeoDocument {
  const labels = keoRoomLabels(rooms, roomLabel);

  return {
    conditions,
    rooms: rooms.map((room, position) => ({name: labels[position]!, values: room.values})),
  };
}
