/**
 * Контракт lookup-канала FormCard ↔ агент-хост.
 *
 * Рендерер шлёт client action `lookup:suggest` с контекстом
 * `{fieldName, referenceId, query}`; хост отвечает ACTIVITY_SNAPSHOT
 * с тем же `messageId`, что у исходного снапшота формы (полный
 * самодостаточный набор операций), и кладёт опции в dataModel через
 * `updateDataModel` по пути `lookupOptionsPath(fieldName)` значением
 * `LookupSuggestData`.
 */

/** Имя client action'а запроса подсказок. */
export const LOOKUP_SUGGEST_ACTION = 'lookup:suggest';

/** Порог начала поиска по умолчанию (символов), если `minChars` не задан. */
export const LOOKUP_MIN_CHARS_DEFAULT = 3;

/**
 * Путь опций поля в dataModel surface'а.
 *
 * Ведущий слэш обязателен: DataModel ключует сигналы точной строкой пути,
 * `lookup/x/options` и `/lookup/x/options` — разные ключи. Хост в
 * `updateDataModel` обязан писать путь в этом же виде (со слэшем).
 */
export function lookupOptionsPath(fieldName: string): string {
  return `/lookup/${fieldName}/options`;
}
