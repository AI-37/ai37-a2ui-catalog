import React from 'react';
import {isProposalHref} from './is-proposal-href';

/**
 * Подпись источника — ссылкой, если адрес открывается как страница; иначе
 * текстом. Документ открывается в новой вкладке, чтобы чат остался на месте.
 */
export function ProposalCardSourceLabel({label, href}: {label: string; href: string | undefined}) {
  if (href === undefined || !isProposalHref(href)) {
    return <>{label}</>;
  }

  return (
    <a className="a2ui-t--accent" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}
