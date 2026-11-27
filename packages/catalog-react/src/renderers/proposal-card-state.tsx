import React from 'react';
import type {ProposalCardState as State} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';
import {useA2uiMessages, type A2uiMessages} from '../i18n';

/**
 * Слова состояния зашиты в рендерер (канон `report-next-status-text`):
 * состояние — перечисление, и слово к нему одно. Открытая пачка красится
 * предупреждением — она ждёт человека, это не ошибка и не успех.
 */
const STATE_VIEW: Record<State, {tone: StatusPillTone; text: keyof A2uiMessages['proposal']}> = {
  open: {tone: 'warning', text: 'stateOpen'},
  accepted: {tone: 'pass', text: 'stateAccepted'},
  rejected: {tone: 'fail', text: 'stateRejected'},
  superseded: {tone: 'neutral', text: 'stateSuperseded'},
};

export function ProposalCardState({state}: {state: State}) {
  const m = useA2uiMessages();
  const view = STATE_VIEW[state];

  return <StatusPill tone={view.tone}>{m.proposal[view.text]}</StatusPill>;
}
