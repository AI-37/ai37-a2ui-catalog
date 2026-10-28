import React from 'react';
import type {ProposalCardState as State} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';

/**
 * Слова состояния зашиты в рендерер (канон `report-next-status-text`):
 * состояние — перечисление, и слово к нему одно. Открытая пачка красится
 * предупреждением — она ждёт человека, это не ошибка и не успех.
 */
const STATE_VIEW: Record<State, {tone: StatusPillTone; text: string}> = {
  open: {tone: 'warning', text: 'ждёт подтверждения'},
  accepted: {tone: 'pass', text: 'подтверждено'},
  rejected: {tone: 'fail', text: 'отклонено'},
  superseded: {tone: 'neutral', text: 'заменено'},
};

export function ProposalCardState({state}: {state: State}) {
  const view = STATE_VIEW[state];

  return <StatusPill tone={view.tone}>{view.text}</StatusPill>;
}
