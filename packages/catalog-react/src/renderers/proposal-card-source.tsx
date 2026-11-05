import React from 'react';
import type {ProposalSource} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardSourceLabel} from './proposal-card-source-label';
import {ProposalCardSourceLinks} from './proposal-card-source-links';

/**
 * Цитата источника на утопленном фоне: человек сверяет, что агент понял
 * сказанное. Подпись — откуда цитата (`Голосовое сообщение · 0:21`), за ней
 * в той же строке ссылки на записи.
 */
export function ProposalCardSource({source}: {source: ProposalSource | undefined}) {
  if (source === undefined) {
    return null;
  }

  const hasLinks = (source.links ?? []).length > 0;

  return (
    <figure style={figureStyle}>
      {source.quote !== undefined ? (
        <blockquote className="a2ui-t--sub" style={quoteStyle}>
          {source.quote}
        </blockquote>
      ) : null}
      {source.label !== undefined || hasLinks ? (
        <figcaption className="a2ui-t--sub a2ui-t--muted" style={captionStyle}>
          {source.label !== undefined ? <ProposalCardSourceLabel label={source.label} href={source.href} /> : null}
          <ProposalCardSourceLinks links={source.links} />
        </figcaption>
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
const captionStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2px 10px',
  overflowWrap: 'anywhere',
};
