import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import type {LiftFieldValues} from './lift-editor.types';

/** Значения нового экрана: дефолты полей, остальное пусто. */
export function seedLiftValues(fields: readonly LiftEditorField[]): LiftFieldValues {
  const values: LiftFieldValues = {};

  for (const field of fields) {
    // lookup-дефолт ({value,label}) в этом компоненте не используется — берём
    // только примитивы, чтобы в submit не уехал объект вместо значения.
    const defaultValue = field.defaultValue;
    values[field.name] =
      defaultValue === undefined || typeof defaultValue === 'object' ? '' : defaultValue;
  }

  return values;
}
