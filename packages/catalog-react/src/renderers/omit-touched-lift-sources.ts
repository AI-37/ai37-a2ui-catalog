import type {LiftEditorSectionSources} from '@ai37/a2ui-catalog-schemas';

/**
 * Источники значений экрана без тронутых полей: правка делает значение
 * пользовательским, и подпись «предложено агентом» на нём становится ложью.
 * Снятие — по факту правки, а не по сравнению значений (как
 * `omit-touched-sources` теплотеха).
 */
export function omitTouchedLiftSources(
  sources: LiftEditorSectionSources,
  isTouched: (field: string) => boolean,
): LiftEditorSectionSources {
  return Object.fromEntries(Object.entries(sources).filter(([field]) => !isTouched(field)));
}
