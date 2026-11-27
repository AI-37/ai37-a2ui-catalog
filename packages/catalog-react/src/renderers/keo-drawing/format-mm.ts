/** Метры → подпись размерной линии в мм, как на листе: 5,4 → «5400». */
export function formatMm(value: number): string {
  return String(Math.round(value * 1000));
}
