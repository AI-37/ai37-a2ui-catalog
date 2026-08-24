import React from 'react';
import type {ReportTableProps} from './report-table.types';

/**
 * Таблица отчёта с итоговой строкой. Прокручивается внутри своего контейнера,
 * страница по горизонтали не едет.
 *
 * Итог набран `colSpan` по всем колонкам, кроме последней: подпись у него
 * длинная и в колонку «Слой» не помещается.
 */
export function ReportTable({columns, rows, footer}: ReportTableProps) {
  return (
    <div className="a2ui-table-scroll">
      <table className="a2ui-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={`${column}-${index}`}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
          <tr className="a2ui-table__footer">
            <td colSpan={Math.max(columns.length - 1, 1)}>{footer.label}</td>
            <td>{footer.value}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
