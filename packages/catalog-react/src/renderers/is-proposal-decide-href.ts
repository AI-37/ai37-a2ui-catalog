/**
 * Адрес страницы решений: путь от корня хоста (`/cabinet/…`) или http(s).
 * Схема формат не проверяет, а `javascript:` и `//чужой-хост` в href — уже
 * не ссылка на страницу кабинета.
 */
export function isProposalDecideHref(href: string): boolean {
  return /^\/(?![/\\])/.test(href) || /^https?:\/\//i.test(href);
}
