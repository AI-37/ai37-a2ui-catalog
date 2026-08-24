export interface NumberFieldProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** Шаг стрелок и клавиш `↑`/`↓`: у температур он дробный, у суток целый. */
  step?: number;
  /**
   * Поле под 4–5 знаков (толщина 380, λ 0.048): растянутая на всю колонку
   * коробка обещает длинное значение, которого не бывает.
   */
  compact?: boolean;
  /** Нижняя граница: у толщины и λ отрицательного значения не бывает. */
  min?: number;
  disabled?: boolean;
  name?: string;
  /** Доступное имя, когда подпись поля не годится (λ вручную внутри своей строки). */
  'aria-label'?: string;
}
