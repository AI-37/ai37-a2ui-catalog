import React from 'react';
import type {ProposalItem} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardListRow} from './proposal-card-list-row';

/** Пункты строками «новое / изменено / удалено» в порядке, в каком их прислал агент. */
export function ProposalCardList({items}: {items: ProposalItem[]}) {
  return (
    <ul style={listStyle}>
      {items.map(item => (
        <ProposalCardListRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

const listStyle: React.CSSProperties = {display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none'};
