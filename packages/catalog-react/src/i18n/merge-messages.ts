import type {A2uiMessages} from './messages-ru';
import type {PluralMessage} from './plural-message';

type DeepPartial<T> = T extends string
  ? string
  : T extends PluralMessage
    ? Partial<PluralMessage>
    : {readonly [K in keyof T]?: DeepPartial<T[K]>};

/** Переводы хоста: любая часть словаря, перекрывает встроенные по ключам. */
export type A2uiMessagesOverride = DeepPartial<A2uiMessages>;

type Tree = {readonly [key: string]: unknown};

/**
 * Глубокое слияние словаря с переводами хоста. Берутся только ключи, которые
 * есть во встроенном словаре, и только того же вида: строка перекрывает строку,
 * объект сливается с объектом. Лишнее и пустое от хоста не попадает — опечатка
 * в его JSON не ломает подпись.
 */
export function mergeA2uiMessages(
  base: A2uiMessages,
  override: A2uiMessagesOverride | undefined,
): A2uiMessages {
  return override === undefined ? base : (mergeTree(base, override as Tree) as A2uiMessages);
}

function mergeTree(base: Tree, override: Tree): Tree {
  const merged: Record<string, unknown> = {...base};

  for (const [key, value] of Object.entries(override)) {
    if (key in base) merged[key] = mergeValue(base[key], value);
  }

  return merged;
}

function mergeValue(base: unknown, value: unknown): unknown {
  if (typeof base === 'string') {
    return typeof value === 'string' && value !== '' ? value : base;
  }
  if (isTree(base) && isTree(value)) {
    return mergeTree(base, value);
  }
  return base;
}

function isTree(value: unknown): value is Tree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
