import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {flexTableDefinition} from '@ai37/a2ui-catalog-schemas';
import {mapAlign, useA2uiBaseStyles} from './shared';
import {tokens} from './tokens';

export const FlexTable = createComponentImplementation(flexTableDefinition, ({props}) => {
  useA2uiBaseStyles();

  return (
    <section style={{display: 'grid', gap: 12}}>
      {props.title ? <h3 style={{margin: 0, fontSize: '1.05rem'}}>{props.title}</h3> : null}
      <div style={{overflowX: 'auto', borderRadius: 18, border: `1px solid ${tokens.border}`}}>
        <table style={{width: '100%', borderCollapse: 'collapse', background: tokens.surface}}>
          {props.caption ? <caption style={{padding: 12, textAlign: 'left', color: tokens.textMuted}}>{props.caption}</caption> : null}
          <thead style={{background: tokens.surfaceHeader}}>
            {props.headerRows.map((row, rowIndex) => (
              <tr key={`header-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <th
                    key={`header-cell-${rowIndex}-${cellIndex}`}
                    colSpan={cell.colSpan ?? 1}
                    rowSpan={cell.rowSpan ?? 1}
                    style={{
                      padding: props.dense ? '10px 12px' : '14px 16px',
                      borderBottom: `1px solid ${tokens.borderSoft}`,
                      borderRight: `1px solid ${tokens.borderSubtle}`,
                      textAlign: mapAlign(cell.align),
                      fontWeight: cell.emphasis === 'strong' ? 800 : 700,
                      color: cell.emphasis === 'muted' ? tokens.textMuted : tokens.textStrong,
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
                      borderBottom: `1px solid ${tokens.borderSubtle}`,
                      borderRight: `1px solid ${tokens.borderFaint}`,
                      textAlign: mapAlign(cell.align),
                      fontWeight: cell.emphasis === 'strong' ? 700 : 500,
                      color: cell.emphasis === 'muted' ? tokens.textSubtle : tokens.text,
                      background: rowIndex % 2 === 0 ? tokens.surface : tokens.surfaceMuted,
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
