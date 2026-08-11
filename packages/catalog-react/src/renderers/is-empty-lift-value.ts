/**
 * Незаполненное значение поля редактора. `false` у чекбокса — это заполненный
 * ответ «нет», а не пустота, поэтому проверяется только пустая строка/отсутствие.
 */
export function isEmptyLiftValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
