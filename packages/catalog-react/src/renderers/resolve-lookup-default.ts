import type {FormField, LookupOption} from '@ai37/a2ui-catalog-schemas';

/** `defaultValue` lookup-поля (`{value, label}`) → предвыбранная опция или null. */
export function resolveLookupDefault(field: FormField): LookupOption | null {
  if (typeof field.defaultValue === 'object' && field.defaultValue !== null) {
    return field.defaultValue as LookupOption;
  }

  return null;
}
