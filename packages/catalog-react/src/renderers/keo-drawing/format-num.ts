/** Число с запятой в качестве десятичного разделителя: 19.98 → «20,0». */
export function formatNum(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',');
}
