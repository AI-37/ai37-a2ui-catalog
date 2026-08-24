import type React from 'react';

export interface FormProps {
  /** Число колонок в широком контейнере; в узком форма всегда одноколоночная. */
  columns?: 1 | 2;
  children: React.ReactNode;
}

export interface FieldProps {
  label: React.ReactNode;
  /** Контрол или значение — Input, Select, Static. */
  children: React.ReactNode;
}
