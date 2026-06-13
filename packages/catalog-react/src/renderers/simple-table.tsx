import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {simpleTableDefinition} from '@ai37/a2ui-catalog-schemas';
import {mapAlign, toDisplayValue, useA2uiBaseStyles} from './shared';

export const SimpleTable = createComponentImplementation(simpleTableDefinition, ({props}) => {
  useA2uiBaseStyles();

  return (
    <section style={{display: 'grid', gap: 12}}>
      {props.title ? <h3 style={{margin: 0, fontSize: '1.05rem'}}>{props.title}</h3> : null}
      <div style={{overflowX: 'auto', borderRadius: 18, border: '1px solid rgba(15, 23, 42, 0.12)'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', background: '#fffdf8'}}>
          {props.caption ? <caption style={{padding: 12, textAlign: 'left', color: '#475569'}}>{props.caption}</caption> : null}
          <thead style={{background: '#f3efe2'}}>
            <tr>
              {props.columns.map(column => (
                <th
                  key={column.key}
                  style={{
                    padding: props.compact ? '10px 12px' : '14px 16px',
                    textAlign: mapAlign(column.align),
                    borderBottom: '1px solid rgba(15, 23, 42, 0.1)',
                    width: column.width,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} style={props.striped && rowIndex % 2 === 1 ? {background: '#f8fafc'} : undefined}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={{
                      padding: props.compact ? '10px 12px' : '14px 16px',
                      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                      textAlign: mapAlign(props.columns[cellIndex]?.align),
                    }}
                  >
                    {toDisplayValue(cell)}
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
