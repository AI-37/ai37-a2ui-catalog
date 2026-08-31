/**
 * Русское согласование числительного: 1 значение, 2 значения, 5 значений.
 * Живёт отдельно от вызывающего — сводок с числами в отчётах будет больше
 * одной, а второй копии правила заводить не за чем.
 */
export function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod100 = count % 100;
  const mod10 = count % 10;

  if (mod100 >= 11 && mod100 <= 14) {
    return many;
  }
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }

  return many;
}
