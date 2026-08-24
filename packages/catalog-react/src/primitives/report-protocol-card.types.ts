import type React from 'react';

export interface ReportProtocolCardProps {
  /** Лейбл строки: «Протокол расчёта». */
  label: string;
  /** Мета: «ГОСТ Р 52941-2008 · Прил. А · 12 шагов». Нет меты — нет строки. */
  meta?: string | undefined;
  /** Правый край: «Скачать ⌄». Скачивать нечего — слот пуст. */
  action?: React.ReactNode;
}
