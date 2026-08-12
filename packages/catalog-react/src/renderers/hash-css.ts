/**
 * Короткий хэш содержимого стилевого слоя (FNV-1a, 32 бита, base36).
 *
 * Нужен в `href` тега стилей: React 19 дедуплицирует `<style href precedence>`
 * по этому ключу и содержимое уже вставленного тега больше не трогает. С
 * постоянным `href` страница с HMR остаётся на стилях момента первой загрузки —
 * правки CSS не видны, пока вкладку не перезагрузят. Хэш делает ключ функцией
 * содержимого: изменился CSS — изменился `href` — вставляется новый тег.
 */
export function hashCss(css: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < css.length; index += 1) {
    hash ^= css.charCodeAt(index);
    // FNV-простое умножение через сдвиги: Math.imul держит результат в 32 битах.
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}
