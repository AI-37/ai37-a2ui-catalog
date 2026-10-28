import React from 'react';
import type {ProposalItem, ProposalItemKind} from '@ai37/a2ui-catalog-schemas';
import {formatProposalItemValue} from './format-proposal-item-value';
import {ProposalCardItemStatus} from './proposal-card-item-status';

/** Слово вида правки перед строкой: в макете F02 это «+ узел», «изменение: …». */
const KIND_TEXT: Record<ProposalItemKind, string> = {
  added: 'новое',
  changed: 'изменено',
  removed: 'удалено',
};

/** Строка пункта: слово вида, «что: было → станет», пилюля решённого пункта. */
export function ProposalCardListRow({item}: {item: ProposalItem}) {
  const value = formatProposalItemValue(item);

  return (
    <li style={rowStyle} data-kind={item.kind}>
      <span className="a2ui-t--sub a2ui-t--muted" style={kindStyle}>
        {KIND_TEXT[item.kind]}
      </span>
      <span className="a2ui-t--body" style={textStyle}>
        {value === '' ? item.label : `${item.label}: ${value}`}
      </span>
      <ProposalCardItemStatus status={item.status} />
    </li>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '2px 10px',
};
/* Колонка слова вида ровная, чтобы тексты пунктов вставали в столбик. */
const kindStyle: React.CSSProperties = {flex: '0 0 72px'};
const textStyle: React.CSSProperties = {flex: '1 1 220px', minWidth: 0, overflowWrap: 'anywhere'};
