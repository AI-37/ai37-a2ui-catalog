import {A2UI_DEFAULT_I18N, formatPlural, type A2uiI18n} from '../i18n';

/** Текст чипа «N слой/слоя/слоёв без λ» по правилам множественного числа локали. */
export function formatMissingLambda(
  count: number,
  {locale, messages}: A2uiI18n = A2UI_DEFAULT_I18N,
): string {
  return formatPlural(locale, messages.constructions.missingLambda, count);
}
