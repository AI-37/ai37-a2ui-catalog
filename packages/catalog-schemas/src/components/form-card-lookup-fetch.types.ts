import type {LookupOption} from './form-card-lookup.types';

/**
 * Тело 200-ответа `GET {LOOKUP_SUGGEST_ROUTE}?referenceId=&query=`.
 * Опции могут нести доп. поля (например регион города) для строки дропдауна.
 */
export type LookupSuggestResponse = {
  options: Array<LookupOption & Record<string, unknown>>;
};
