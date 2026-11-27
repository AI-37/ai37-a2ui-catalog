import React from 'react';
import {A2UI_MESSAGES} from './builtin-messages';
import {mergeA2uiMessages, type A2uiMessagesOverride} from './merge-messages';
import {RU_MESSAGES, type A2uiMessages} from './messages-ru';
import {A2UI_DEFAULT_LOCALE, resolveA2uiLocale} from './resolve-a2ui-locale';

/** Что рендерер знает о языке: тег для форматтеров и словарь подписей. */
export interface A2uiI18n {
  locale: string;
  messages: A2uiMessages;
}

/** Без провайдера каталог говорит по-русски, как до локали. */
export const A2UI_DEFAULT_I18N: A2uiI18n = {locale: A2UI_DEFAULT_LOCALE, messages: RU_MESSAGES};

const A2uiI18nContext = React.createContext<A2uiI18n>(A2UI_DEFAULT_I18N);

export interface A2uiI18nProviderProps {
  /** Полный тег BCP-47 (`es`, `es-MX`, `pt-BR`); обрезать до языка не нужно. */
  locale: string;
  /** Переводы хоста: перекрывают встроенный словарь по ключам. */
  messages?: A2uiMessagesOverride;
  children?: React.ReactNode;
}

/**
 * Язык подписей каталога. Хост ставит провайдер над поверхностями A2UI и
 * передаёт свою локаль; словарь берётся по цепочке «точный тег → язык → en»,
 * переводы хоста ложатся поверх. Тексты, которые присылает агент, сюда не
 * относятся — их переводит агент.
 */
export function A2uiI18nProvider({locale, messages, children}: A2uiI18nProviderProps) {
  const value = React.useMemo(() => createA2uiI18n(locale, messages), [locale, messages]);

  return <A2uiI18nContext.Provider value={value}>{children}</A2uiI18nContext.Provider>;
}

/** Словарь и тег для локали — то же, что кладёт провайдер. Пригодится и вне React. */
export function createA2uiI18n(locale: string, messages?: A2uiMessagesOverride): A2uiI18n {
  const resolved = resolveA2uiLocale(locale);

  return {
    locale: resolved.locale,
    messages: mergeA2uiMessages(A2UI_MESSAGES[resolved.language], messages),
  };
}

export function useA2uiI18n(): A2uiI18n {
  return React.useContext(A2uiI18nContext);
}

/** Короткий путь для компонентов, которым нужны только подписи. */
export function useA2uiMessages(): A2uiMessages {
  return React.useContext(A2uiI18nContext).messages;
}
