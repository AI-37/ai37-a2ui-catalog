/**
 * Ключ пометки «поле правлено вручную»: методика + вкладка лифта + поле.
 * Методика в ключе не даёт пометке протечь в одноимённое поле другой ветки.
 */
export function liftTouchedKey(method: string, liftIndex: number, field: string): string {
  return `${method}|${liftIndex}|${field}`;
}
