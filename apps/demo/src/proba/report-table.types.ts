export interface ReportTableFooter {
  /** Подпись итога: «R₀ приведённое · с сопротивлениями поверхностей». */
  label: string;
  value: string;
}

export interface ReportTableProps {
  columns: string[];
  /** Ячейки готовыми строками: таблица ничего не считает и не форматирует. */
  rows: string[][];
  footer: ReportTableFooter;
}
