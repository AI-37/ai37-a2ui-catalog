/**
 * Опция подсказки lookup-поля; в submit уходит `value`, пользователю
 * показывается `label`. `group`/`title`/`meta` — необязательные слоты
 * оформления многострочного рендера; `label` остаётся обязательным и
 * самодостаточным — именно он попадает в поле после выбора опции.
 */
export type LookupOption = {
  value: string;
  label: string;
  /** Надстрочный контекст (раздел справочника, регион). */
  group?: string;
  /** Основная строка многострочного рендера; без неё опция рендерится одной строкой `label`. */
  title?: string;
  /** Приглушённая нижняя строка (числа, климат). */
  meta?: string;
};

/** Значение в dataModel по пути `lookupOptionsPath(fieldName)`. */
export type LookupSuggestData = {
  /** Эхо `query` из `lookup:suggest` — для отбрасывания устаревших ответов. */
  query: string;
  options: LookupOption[];
};

/** Контекст client action'а `lookup:suggest`. */
export type LookupSuggestActionContext = {
  fieldName: string;
  referenceId: string;
  query: string;
};
