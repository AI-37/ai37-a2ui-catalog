export type SplitFirstMatch = {
  before: string;
  match: string;
  after: string;
};

/**
 * Первое вхождение подстроки без учёта регистра → три части исходной строки
 * (`match` сохраняет регистр оригинала). Поиск — `toLowerCase().indexOf()`,
 * без RegExp: спецсимволы ввода (`(`, `[`, `\`) — обычные символы, не
 * синтаксис. Нет вхождения или пустой запрос — `null`, подсвечивать нечего.
 */
export function splitFirstMatch(text: string, query: string): SplitFirstMatch | null {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return null;
  }

  const index = text.toLowerCase().indexOf(needle);
  if (index === -1) {
    return null;
  }

  return {
    before: text.slice(0, index),
    match: text.slice(index, index + needle.length),
    after: text.slice(index + needle.length),
  };
}
