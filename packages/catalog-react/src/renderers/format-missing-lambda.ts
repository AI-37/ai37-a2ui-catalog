/** Текст чипа «N слой/слоя/слоёв без λ» по русским правилам множественного числа. */
export function formatMissingLambda(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'слой'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'слоя'
        : 'слоёв';
  return `${count} ${noun} без λ`;
}
