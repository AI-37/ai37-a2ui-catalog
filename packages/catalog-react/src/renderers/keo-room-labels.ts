import type {KeoRoomDraft} from './keo-next.types';

/**
 * Подписи помещений в порядке экранов: присланное имя либо «{roomLabel} N».
 * Отдельным модулем, потому что подпись нужна двоим — экрану и документу,
 * который уезжает агенту: разъехавшись, они назвали бы одно помещение по-разному.
 */
export function keoRoomLabels(rooms: readonly KeoRoomDraft[], roomLabel: string): string[] {
  return rooms.map((room, position) => room.name ?? `${roomLabel} ${position + 1}`);
}
