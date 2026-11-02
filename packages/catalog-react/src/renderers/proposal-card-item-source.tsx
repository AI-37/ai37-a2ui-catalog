import React from 'react';
import type {ProposalSource} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardSourceLabel} from './proposal-card-source-label';

/**
 * Источник пункта приглушённой строкой под ним: документ и страница, рядом
 * цитата в кавычках. Без утопленного фона, как у цитаты всей пачки: пунктов
 * бывает до пятидесяти, и плашка у каждого забила бы карточку.
 */
export function ProposalCardItemSource({source}: {source: ProposalSource | undefined}) {
  if (source === undefined) {
    return null;
  }

  return (
    <span className="a2ui-t--sub a2ui-t--muted" style={lineStyle}>
      {source.label !== undefined ? <ProposalCardSourceLabel label={source.label} href={source.href} /> : null}
      {source.quote !== undefined ? <span>«{source.quote}»</span> : null}
    </span>
  );
}

const lineStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2px 10px',
  overflowWrap: 'anywhere',
};
