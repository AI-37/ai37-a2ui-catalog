import {A2UI_DEFAULT_LOCALE, formatDecimal} from '../../i18n';

/** Число с разделителем локали: 19.98 → «20,0» по-русски, «20.0» по-английски. */
export function formatNum(value: number, digits = 1, locale: string = A2UI_DEFAULT_LOCALE): string {
  return formatDecimal(locale, value, {min: digits, max: digits});
}
