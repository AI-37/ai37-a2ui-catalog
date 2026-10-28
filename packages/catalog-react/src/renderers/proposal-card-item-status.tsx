import React from 'react';
import type {ProposalItemStatus} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';

/**
 * Статус пункта. Ждущий решения пункт пилюли не несёт: ждёт вся пачка, и
 * это уже сказано в шапке. Устаревший — предупреждение: цель поменялась
 * после предложения, решать его вслепую нельзя.
 */
const STATUS_VIEW: Record<Exclude<ProposalItemStatus, 'pending'>, {tone: StatusPillTone; text: string}> =
  {
    accepted: {tone: 'pass', text: 'принято'},
    rejected: {tone: 'fail', text: 'отклонено'},
    stale: {tone: 'warning', text: 'устарело'},
  };

export function ProposalCardItemStatus({status}: {status: ProposalItemStatus | undefined}) {
  if (status === undefined || status === 'pending') {
    return null;
  }
  const view = STATUS_VIEW[status];

  return <StatusPill tone={view.tone}>{view.text}</StatusPill>;
}
