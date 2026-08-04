let counter = 0;

/**
 * Клиентский id новой конструкции — ключ React-списка; агент значения
 * игнорирует. Счётчик поверх random исключает коллизии в пределах вкладки.
 */
export function createLocalId(): string {
  counter += 1;
  return `local-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}
