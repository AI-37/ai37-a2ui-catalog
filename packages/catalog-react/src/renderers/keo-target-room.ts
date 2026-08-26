/**
 * id помещения из ключа цели `{id}::{секция}`; у «Условий» помещения нет.
 * Раскрытие секции внутри помещения бессмысленно без раскрытого помещения,
 * поэтому навигация всегда открывает пару.
 */
export function keoTargetRoom(target: string): string | undefined {
  const at = target.indexOf('::');

  return at === -1 ? undefined : target.slice(0, at);
}
