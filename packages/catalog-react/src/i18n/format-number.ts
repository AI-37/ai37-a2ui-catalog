/**
 * Десятичное число по локали без разрядов: «20,0» по-русски, «20.0» по-английски.
 * Разряды не ставятся намеренно — так выглядели подписи до локали (чертежи,
 * границы полей), и метрам и миллиметрам в подписи они не нужны.
 */
export function formatDecimal(
  locale: string,
  value: number,
  fractionDigits: {min?: number; max: number},
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: fractionDigits.min ?? 0,
    maximumFractionDigits: fractionDigits.max,
    useGrouping: false,
  });
}

/** Целое с разрядами по локали: «6 380» по-русски, «6,380» по-английски. */
export function formatInteger(locale: string, value: number): string {
  return Math.round(value).toLocaleString(locale, {maximumFractionDigits: 0});
}
