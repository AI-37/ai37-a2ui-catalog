/** Языки встроенных словарей каталога. Новый язык — словарь и строка здесь. */
export const A2UI_BUILTIN_LANGUAGES = ['ru', 'en', 'es', 'de', 'fr', 'pt'] as const;

export type A2uiBuiltinLanguage = (typeof A2UI_BUILTIN_LANGUAGES)[number];

/** Язык, которым каталог говорит без провайдера: прежнее поведение. */
export const A2UI_DEFAULT_LOCALE = 'ru';

/** Последнее звено цепочки фолбэка (контракт `ecosystem/v2.4/06-i18n-locale.md`). */
export const A2UI_FALLBACK_LOCALE = 'en';

export interface ResolvedA2uiLocale {
  /** Тег, по которому форматируются числа: присланный целиком или `en`, если словаря нет. */
  locale: string;
  /** Чей словарь берётся. */
  language: A2uiBuiltinLanguage;
}

/**
 * Цепочка фолбэка: точный тег → язык без региона и варианта → `en`. Тег не
 * обрезается: `es-MX` остаётся `es-MX` для форматтеров и берёт словарь `es`.
 * Язык без словаря (`pl`) и битый тег уходят в `en` целиком — подписи и числа
 * тогда на одном языке.
 */
export function resolveA2uiLocale(tag: string): ResolvedA2uiLocale {
  const canonical = canonicalTag(tag);
  if (canonical === undefined) {
    return {locale: A2UI_FALLBACK_LOCALE, language: A2UI_FALLBACK_LOCALE};
  }

  const exact = findBuiltin(canonical.toLowerCase());
  const language = exact ?? findBuiltin(canonical.split('-')[0]!.toLowerCase());

  return language === undefined
    ? {locale: A2UI_FALLBACK_LOCALE, language: A2UI_FALLBACK_LOCALE}
    : {locale: canonical, language};
}

function canonicalTag(tag: string): string | undefined {
  try {
    return Intl.getCanonicalLocales(tag.trim())[0];
  } catch {
    return undefined;
  }
}

function findBuiltin(candidate: string): A2uiBuiltinLanguage | undefined {
  return A2UI_BUILTIN_LANGUAGES.find(language => language === candidate);
}
