import React from 'react';
import type {ProposalItemStatus} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';
import {useA2uiMessages, type A2uiMessages} from '../i18n';

/**
 * Статус пункта. Ждущий решения пункт пилюли не несёт: ждёт вся пачка, и
 * это уже сказано в шапке. Устаревший — предупреждение: цель поменялась
 * после предложения, решать его вслепую нельзя.
 */
const STATUS_VIEW: Record<
  Exclude<ProposalItemStatus, 'pending'>,
  {tone: StatusPillTone; text: keyof A2uiMessages['proposal']}
> = {
  accepted: {tone: 'pass', text: 'itemAccepted'},
  rejected: {tone: 'fail', text: 'itemRejected'},
  stale: {tone: 'warning', text: 'itemStale'},
};

export function ProposalCardItemStatus({status}: {status: ProposalItemStatus | undefined}) {
  const m = useA2uiMessages();
  if (status === undefined || status === 'pending') {
    return null;
  }
  const view = STATUS_VIEW[status];

  return <StatusPill tone={view.tone}>{m.proposal[view.text]}</StatusPill>;
}
