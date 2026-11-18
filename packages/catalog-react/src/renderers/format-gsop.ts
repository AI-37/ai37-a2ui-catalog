import {A2UI_DEFAULT_LOCALE, formatInteger} from '../i18n';

/**
 * ГСОП с разрядами по локали: «6 380» по-русски, «6,380» по-английски. Локаль
 * передаётся явно, а не берётся из среды: у SSR и у браузера она разная, и
 * разметка разъезжалась бы при гидратации.
 */
export function formatGsop(value: number, locale: string = A2UI_DEFAULT_LOCALE): string {
  return formatInteger(locale, value);
}
