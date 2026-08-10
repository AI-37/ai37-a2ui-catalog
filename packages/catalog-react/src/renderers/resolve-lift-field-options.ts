import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import type {LiftFieldOption, LiftFieldValues} from './lift-editor.types';

/**
 * Подсказки поля. При `optionsBy` ряд выбирается по текущему значению
 * управляющего поля (ряды Прил. Е различаются по типу здания): значение вне
 * нового ряда не сбрасывается — оно допустимо, просто перестало быть подсказкой.
 */
export function resolveLiftFieldOptions(
  field: LiftEditorField,
  building: LiftFieldValues,
  lift: LiftFieldValues,
): LiftFieldOption[] {
  const values = field.optionsBy?.scope === 'building' ? building : lift;
  const options = field.optionsBy
    ? (field.optionsBy.options[String(values[field.optionsBy.source] ?? '')] ?? [])
    : (field.options ?? []);

  return options.map(value => {
    const note = field.optionNotes?.[value];
    return note === undefined ? {value, label: value} : {value, label: value, note};
  });
}
