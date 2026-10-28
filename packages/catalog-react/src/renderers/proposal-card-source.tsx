import React from 'react';
import type {ProposalSource} from '@ai37/a2ui-catalog-schemas';

/**
 * Цитата источника на утопленном фоне: человек сверяет, что агент понял
 * сказанное. Подпись — откуда цитата (`Голосовое сообщение · 0:21`).
 */
export function ProposalCardSource({source}: {source: ProposalSource | undefined}) {
  if (source === undefined) {
    return null;
  }

  return (
    <figure style={figureStyle}>
      <blockquote className="a2ui-t--sub" style={quoteStyle}>
        {source.quote}
      </blockquote>
      {source.label !== undefined ? (
        <figcaption className="a2ui-t--sub a2ui-t--muted">{source.label}</figcaption>
      ) : null}
    </figure>
  );
}

const figureStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  margin: 0,
  padding: '12px 14px',
  borderRadius: 'var(--a2ui-card-radius-sunken)',
  background: 'var(--a2ui-card-surface-sunken)',
};
const quoteStyle: React.CSSProperties = {margin: 0, overflowWrap: 'anywhere'};
