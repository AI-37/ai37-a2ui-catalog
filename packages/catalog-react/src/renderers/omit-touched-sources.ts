import type {ConstructionsGeneralSources} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsGeneralKey} from './constructions-editor.types';

/**
 * Источники значений без тронутых полей: правка делает значение
 * пользовательским, и подпись «предложено агентом» на нём становится ложью.
 *
 * Снятие — по факту правки, а не по сравнению значений: пользователь, вернувший
 * +21 обратно на +20, всё равно поле проверил (Решение 5 design.md).
 */
export function omitTouchedSources(
  sources: ConstructionsGeneralSources | undefined,
  touched: ReadonlySet<ConstructionsGeneralKey>,
): ConstructionsGeneralSources {
  if (sources === undefined) return {};

  return Object.fromEntries(
    Object.entries(sources).filter(([key]) => !touched.has(key as ConstructionsGeneralKey)),
  );
}
