import React from 'react';
import type {ProposalSourceLink} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardSourceLabel} from './proposal-card-source-label';

/**
 * Ссылки источника после подписи: записи, из которых собрана пачка. Каждая
 * в своём `span`, иначе соседние подписи без адреса слились бы в один текст
 * без зазора. Ссылка без `href` (или с неоткрываемым адресом) — подпись.
 */
export function ProposalCardSourceLinks({links}: {links: ProposalSourceLink[] | undefined}) {
  return (links ?? []).map((link, index) => (
    <span key={index}>
      <ProposalCardSourceLabel label={link.label} href={link.href} />
    </span>
  ));
}
