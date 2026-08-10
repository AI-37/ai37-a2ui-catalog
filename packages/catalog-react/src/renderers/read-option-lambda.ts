import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/**
 * Читает λА/λБ из доп. полей опции подсказки (контракт fetch-ответа —
 * `LookupOption & Record<string, unknown>`; агент-владелец справочника кладёт
 * `lambdaA`/`lambdaB` числами). Не число или ≤0 — поля нет.
 */
export function readOptionLambda(
  option: LookupOption,
  key: 'lambdaA' | 'lambdaB',
): number | undefined {
  const value = (option as LookupOption & Record<string, unknown>)[key];

  if (typeof value !== 'number' || value <= 0) {
    return undefined;
  }

  return value;
}
