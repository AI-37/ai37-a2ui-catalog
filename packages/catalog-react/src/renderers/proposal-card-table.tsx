import React from 'react';
import type {ProposalItem} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardItemStatus} from './proposal-card-item-status';

/**
 * Пункты таблицей «Что · Было · Станет · С какой даты» на классах таблицы
 * набора (`a2ui-table`): скролл в своём контейнере, первая колонка тянется.
 * Колонка даты есть, только если дату прислали хотя бы у одного пункта.
 */
export function ProposalCardTable({items}: {items: ProposalItem[]}) {
  const withDate = items.some(item => item.effectiveFrom !== undefined);

  return (
    <div className="a2ui-table-scroll">
      <table className="a2ui-table">
        <thead>
          <tr>
            <th scope="col">Что</th>
            <th scope="col">Было</th>
            <th scope="col">Станет</th>
            {withDate ? <th scope="col">С какой даты</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} data-kind={item.kind}>
              <td>
                <span style={whatStyle}>
                  <span>{item.label}</span>
                  <ProposalCardItemStatus status={item.status} />
                </span>
              </td>
              <td>{item.before ?? '—'}</td>
              <td>{item.after ?? (item.kind === 'removed' ? 'удалено' : '—')}</td>
              {withDate ? <td>{item.effectiveFrom ?? '—'}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const whatStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '2px 10px',
};
