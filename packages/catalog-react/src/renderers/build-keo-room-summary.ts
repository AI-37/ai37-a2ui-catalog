import {buildCalcSectionSummary} from './build-calc-section-summary';
import type {CalcFieldValues} from './calc-editor.types';
import type {KeoEditorSection} from '@ai37/a2ui-catalog-schemas';

/**
 * Сводка свёрнутого помещения: назначение и габариты — то, чем помещения
 * отличаются друг от друга в списке. Берётся первое поле первой секции и вся
 * вторая: полная сводка всех секций — строка на четыре ряда, по ней помещение
 * не опознать.
 */
export function buildKeoRoomSummary(
  sections: readonly KeoEditorSection[],
  values: CalcFieldValues,
): string {
  const first = sections[0]?.fields.slice(0, 1) ?? [];
  const second = sections[1]?.fields ?? [];

  return buildCalcSectionSummary([...first, ...second], values);
}
