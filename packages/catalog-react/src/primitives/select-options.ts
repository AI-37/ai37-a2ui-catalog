import type {SelectOption} from './select.types';

/** Строки и пары к общему виду: дальше список знает только `{value, label}`. */
export function selectOptions(items: Array<string | SelectOption>): SelectOption[] {
  return items.map(item => (typeof item === 'string' ? {value: item, label: item} : item));
}
