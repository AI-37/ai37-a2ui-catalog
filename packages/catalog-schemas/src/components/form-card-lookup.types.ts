/** Опция подсказки lookup-поля; в submit уходит `value`, пользователю показывается `label`. */
export type LookupOption = {
  value: string;
  label: string;
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
