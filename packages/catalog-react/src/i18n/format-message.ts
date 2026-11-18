import type {PluralMessage} from './plural-message';

type Values = Readonly<Record<string, string | number>>;

/** Подстановка `{имя}`; имя без значения остаётся в строке как есть — так пропуск виден. */
export function formatMessage(template: string, values: Values = {}): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = values[name];
    return value === undefined ? placeholder : String(value);
  });
}

/**
 * Форма по числу из `Intl.PluralRules` локали, затем подстановка: `{count}` —
 * само число, остальное — из `values`. Категории, которой нет в словаре
 * (хост перекрыл форму частично), достаётся `other`.
 */
export function formatPlural(
  locale: string,
  message: PluralMessage,
  count: number,
  values: Values = {},
): string {
  const category = new Intl.PluralRules(locale).select(count) as keyof PluralMessage;
  const template = message[category] ?? message.other;

  return formatMessage(template, {...values, count});
}
