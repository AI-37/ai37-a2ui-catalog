/** Метры → отметка уровня ГОСТ: 0,8 → «0,800». */
export function formatLevel(value: number): string {
  const digits = String(Math.round(Math.abs(value) * 1000)).padStart(4, '0');
  return `${digits.slice(0, -3)},${digits.slice(-3)}`;
}
