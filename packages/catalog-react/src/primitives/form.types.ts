import type React from 'react';

export interface FormProps {
  /**
   * Число колонок в широком контейнере; в узком форма всегда одноколоночная.
   * `3` — «строка + два числа»: первая колонка вдвое шире (материал против
   * толщины и λ), и включается она позже, чем две равные.
   */
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}

export interface FieldProps {
  label: React.ReactNode;
  /**
   * Поле шире соседей: занимает всю строку, пока колонок ещё не хватает на его
   * содержимое. В трёхколоночной раскладке ширину даёт сама сетка, и растяжка
   * снимается.
   */
  wide?: boolean;
  /** Контрол или значение — Input, Select, Static. */
  children: React.ReactNode;
}
