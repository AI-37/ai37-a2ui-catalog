import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {flexTableDefinition} from '@ai37-a2ui/catalog-schemas';
import {mapAlign, useA2uiBaseStyles} from './shared';

export const FlexTable = createComponentImplementation(flexTableDefinition, ({props}) => {
  useA2uiBaseStyles();

  return (
    <section style={{display: 'grid', gap: 12}}>
      {props.title ? <h3 style={{margin: 0, fontSize: '1.05rem'}}>{props.title}</h3> : null}
      <div style={{overflowX: 'auto', borderRadius: 18, border: '1px solid rgba(15, 23, 42, 0.12)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', background: '#ffffff'}}>
          {props.caption ? <caption style={{padding: 12, textAlign: 'left', color: '#475569'}}>{props.caption}</caption> : null}
          <thead style={{background: '#e6f0ff'}}>
            {props.headerRows.map((row, rowIndex) => (
              <tr key={`header-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <th
                    key={`header-cell-${rowIndex}-${cellIndex}`}
                    colSpan={cell.colSpan ?? 1}
                    rowSpan={cell.rowSpan ?? 1}
                    style={{
                      padding: props.dense ? '10px 12px' : '14px 16px',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
                      borderRight: '1px solid rgba(15, 23, 42, 0.08)',
                      textAlign: mapAlign(cell.align),
                      fontWeight: cell.emphasis === 'strong' ? 800 : 700,
                      color: cell.emphasis === 'muted' ? '#475569' : '#0f172a',
                    }}
                  >
                    {cell.content}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {props.bodyRows.map((row, rowIndex) => (
              <tr key={`body-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`body-cell-${rowIndex}-${cellIndex}`}
                    colSpan={cell.colSpan ?? 1}
                    rowSpan={cell.rowSpan ?? 1}
                    style={{
                      padding: props.dense ? '10px 12px' : '14px 16px',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                      borderRight: '1px solid rgba(15, 23, 42, 0.05)',
                      textAlign: mapAlign(cell.align),
                      fontWeight: cell.emphasis === 'strong' ? 700 : 500,
                      color: cell.emphasis === 'muted' ? '#64748b' : '#1e293b',
                      background: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                    }}
                  >
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});
