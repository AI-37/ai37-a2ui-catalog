import {calcTouchedKey} from './calc-touched-key';
import {isEmptyLiftValue} from './is-empty-lift-value';
import {isRevealedField} from './is-revealed-field';
import type {KeoRoomDraft} from './keo-next.types';
import type {KeoEditorSection} from '@ai37/a2ui-catalog-schemas';

/**
 * Цели с незаполненными обязательными полями, в порядке экрана: по ним ведёт
 * «Далее» и по ним же ставится пометка «заполните». Скрытое `revealBy` поле
 * незаполненным не считается — его на экране нет.
 */
export function findMissingKeoTargets(
  rooms: readonly KeoRoomDraft[],
  sections: readonly KeoEditorSection[],
): Set<string> {
  const missing = new Set<string>();

  for (const room of rooms) {
    for (const section of sections) {
      const empty = section.fields.some(
        field =>
          field.required === true &&
          isRevealedField(field, room.values) &&
          isEmptyLiftValue(room.values[field.name]),
      );

      if (empty) missing.add(calcTouchedKey(room.id, section.key));
    }
  }

  return missing;
}
