/**
 * Ключ пометки «поле здания правлено вручную»: методика + маркер `building` +
 * поле. Живёт в одном множестве с ключами лифтов (`lift-touched-key`), но с
 * нечисловым сегментом — перенумерация после удаления лифта его не трогает.
 * Нужен только provenance: правила ничего не пишут в поля здания.
 */
export function buildingTouchedKey(method: string, field: string): string {
  return `${method}|building|${field}`;
}
