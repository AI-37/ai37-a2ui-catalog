import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import {isEmptyLiftValue} from './is-empty-lift-value';
import type {LiftFieldValues} from './lift-editor.types';

/** Меньше трёх полей — рамка и заголовок экспандера дороже самих полей. */
const MIN_ADVANCED_FIELDS = 3;

/**
 * Разделение полей экрана на основной столбец и экспандер «Параметры по
 * умолчанию» (Решение 9 design.md). Два инварианта макета: пустое обязательное
 * поле не прячется никогда, и ради одного-двух полей блок не создаётся.
 */
export function splitAdvancedFields(
  fields: readonly LiftEditorField[],
  values: LiftFieldValues,
): {main: LiftEditorField[]; advanced: LiftEditorField[]} {
  const collapsible = fields.filter(
    field => field.advanced && !(field.required && isEmptyLiftValue(values[field.name])),
  );

  if (collapsible.length < MIN_ADVANCED_FIELDS) {
    return {main: [...fields], advanced: []};
  }

  return {
    main: fields.filter(field => !collapsible.includes(field)),
    advanced: collapsible,
  };
}
