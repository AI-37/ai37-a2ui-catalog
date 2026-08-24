/** Вариант ряда-подсказки: значение уходит в форму, `note` — пояснение под ним. */
export interface ComboOption {
  value: string;
  label: string;
  note?: string;
}

export interface ComboProps {
  /** Имя в submit: значение поля и есть подпись, скрытого поля не нужно. */
  name: string;
  /** Ряд-подсказка. Пустой — поле остаётся обычным вводом. */
  options: readonly ComboOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}
