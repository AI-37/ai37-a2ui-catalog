/**
 * Адрес, который карточка делает ссылкой: путь от корня хоста (`/cabinet/…`)
 * или http(s). Так проверяются и страница решений, и документ источника.
 * Схема формат не проверяет, а `javascript:`, `//чужой-хост` и служебная
 * ссылка агента (`project-attachment:…`) в href — уже не ссылка на страницу.
 */
export function isProposalHref(href: string): boolean {
  return /^\/(?![/\\])/.test(href) || /^https?:\/\//i.test(href);
}
