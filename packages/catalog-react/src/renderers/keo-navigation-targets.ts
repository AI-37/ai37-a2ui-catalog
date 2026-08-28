import {calcTouchedKey} from './calc-touched-key';
import {KEO_CONDITIONS_KEY} from './keo-conditions-key';
import type {KeoRoomDraft} from './keo-next.types';
import type {KeoEditorSection} from '@ai37/a2ui-catalog-schemas';

/**
 * Порядок целей «Далее»: условия, затем секции каждого помещения по порядку.
 *
 * Условия целью бывают, только когда они раскрывашка (`conditionsLabel`
 * задан). Без заголовка группа стоит открытым блоком, и вести туда
 * пользователя значит раскрывать уже раскрытое.
 */
export function keoNavigationTargets(
  rooms: readonly KeoRoomDraft[],
  sections: readonly KeoEditorSection[],
  collapsibleConditions: boolean,
): string[] {
  return [
    ...(collapsibleConditions ? [KEO_CONDITIONS_KEY] : []),
    ...rooms.flatMap(room => sections.map(section => calcTouchedKey(room.id, section.key))),
  ];
}
