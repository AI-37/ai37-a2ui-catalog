import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import type {CalcFieldValues} from './calc-editor.types';

/**
 * Значения нового экрана (помещения, расчётной точки, здания): дефолты полей,
 * остальное пусто. Источников у добавленного вручную экрана нет — значения
 * пользовательские, и подписи провенанса на них не выдумываются.
 */
export function seedCalcValues(fields: readonly CalcEditorField[]): CalcFieldValues {
  const values: CalcFieldValues = {};

  for (const field of fields) {
    const defaultValue = field.defaultValue;
    values[field.name] =
      defaultValue === undefined || typeof defaultValue === 'object' ? '' : defaultValue;
  }

  return values;
}
