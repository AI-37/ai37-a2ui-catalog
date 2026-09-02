import {calcTouchedKey} from './calc-touched-key';
import {isEmptyLiftValue} from './is-empty-lift-value';
import {isRevealedField} from './is-revealed-field';
import {KEO_CONDITIONS_KEY} from './keo-conditions-key';
import type {KeoRoomDraft} from './keo-next.types';
import type {CalcCondition, KeoEditorSection} from '@ai37/a2ui-catalog-schemas';

/**
 * Цели с незаполненными обязательными полями, в порядке экрана: по ним ведёт
 * «Далее» и по ним же ставится пометка «заполните». Скрытое `revealBy` поле
 * незаполненным не считается — его на экране нет.
 *
 * Условия идут первыми и участвуют наравне с секциями: город — условие уровня
 * объекта, без него расчёта нет, и вести пользователя в геометрию комнаты
 * раньше него незачем. Незаполненным считается ПРАВИМОЕ условие (с `type`) с
 * пустым значением; у выведенного пустоты не бывает (это ловит схема).
 *
 * `collapsibleConditions` — тот же флаг, что у `keoNavigationTargets`, и по той
 * же причине: без `conditionsLabel` группа стоит открытым блоком без шапки, ей
 * негде нарисовать пометку и незачем быть целью «Далее».
 */
export function findMissingKeoTargets(
  rooms: readonly KeoRoomDraft[],
  sections: readonly KeoEditorSection[],
  conditions: readonly CalcCondition[],
  collapsibleConditions: boolean,
): Set<string> {
  const missing = new Set<string>();

  if (
    collapsibleConditions &&
    conditions.some(condition => condition.type !== undefined && condition.value === '')
  ) {
    missing.add(KEO_CONDITIONS_KEY);
  }

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
