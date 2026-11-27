import {DE_MESSAGES} from './messages-de';
import {EN_MESSAGES} from './messages-en';
import {ES_MESSAGES} from './messages-es';
import {FR_MESSAGES} from './messages-fr';
import {PT_MESSAGES} from './messages-pt';
import {RU_MESSAGES, type A2uiMessages} from './messages-ru';
import type {A2uiBuiltinLanguage} from './resolve-a2ui-locale';

/** Встроенные словари каталога по языку. Русский — источник, остальные — переводы с него. */
export const A2UI_MESSAGES: Readonly<Record<A2uiBuiltinLanguage, A2uiMessages>> = {
  ru: RU_MESSAGES,
  en: EN_MESSAGES,
  es: ES_MESSAGES,
  de: DE_MESSAGES,
  fr: FR_MESSAGES,
  pt: PT_MESSAGES,
};
