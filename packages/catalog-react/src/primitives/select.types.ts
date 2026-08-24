/** Пункт списка, у которого подпись не совпадает со значением (тип конструкции). */
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /**
   * Значения списка. Строка — значение и подпись одновременно (условие
   * эксплуатации, назначение помещений); пара — когда подпись человеческая, а
   * значение доменное (`steny` → «Стены»).
   */
  items: Array<string | SelectOption>;
  value: string | null;
  onValueChange: (value: string | null) => void;
  /** Текст до выбора: у «Условий эксплуатации» пустое значение осмысленно. */
  placeholder?: string;
  disabled?: boolean;
  /** Имя в submit: Select держит скрытый input сам. */
  name?: string;
}
