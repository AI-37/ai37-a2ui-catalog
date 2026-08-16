import React from 'react';
import type {ThermalReportLayersTable} from '@ai37/a2ui-catalog-schemas';

/** Карточка «Конструкция · изнутри наружу»: таблица слоёв с итоговой
 * строкой R₀ на утопленном фоне; первая колонка тянется, числа — справа. */
export function ThermalReportLayersTableCard({table}: {table: ThermalReportLayersTable}) {
  return (
    <div className="a2ui-tr__card">
      <div className="a2ui-tr__table-head">
        <span className="a2ui-tr__table-title">{table.title}</span>
        {table.meta ? <span className="a2ui-tr__table-meta">{table.meta}</span> : null}
      </div>
      <div className="a2ui-tr__table-scroll">
        <table className="a2ui-tr__table">
          <thead>
            <tr>
              {table.columns.map((column, index) => (
                <th key={`${column}-${index}`}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
            <tr className="a2ui-tr__table-footer">
              <td colSpan={Math.max(table.columns.length - 1, 1)}>{table.footer.label}</td>
              <td>{table.footer.value}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
