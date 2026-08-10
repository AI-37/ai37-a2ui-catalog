import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/**
 * Тело ответа suggest-роута → список опций. Malformed-ответ (не объект, нет
 * `options`, элементы без строковых value/label) даёт пустой список — тихий
 * fallback fetch-режима, форма остаётся рабочей.
 */
export function parseLookupOptions(body: unknown): LookupOption[] {
  if (typeof body !== 'object' || body === null) {
    return [];
  }

  const options = (body as {options?: unknown}).options;
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter(
    (option): option is LookupOption =>
      typeof option === 'object' &&
      option !== null &&
      typeof (option as {value?: unknown}).value === 'string' &&
      typeof (option as {label?: unknown}).label === 'string',
  );
}
