import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/**
 * Опция по подписи. У `Autocomplete` нет `itemToStringLabel`: в поле уходит
 * результат `itemToStringValue`, то есть `label`, и он же приходит в
 * `onValueChange` при выборе. Поэтому выбранную опцию находим по подписи в
 * текущем списке — целиком, вместе с климатом и λ.
 */
export function findOptionByLabel(
  options: LookupOption[],
  label: string,
): LookupOption | undefined {
  return options.find(option => option.label === label);
}
