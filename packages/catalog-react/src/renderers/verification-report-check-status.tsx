import React from 'react';
import type {VerificationReportCheckStatus as CheckStatus} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';

/**
 * Слова статуса зашиты в рендерер, а не приходят строкой (канон
 * `report-next-status-text`): статус — перечисление, и слово к нему одно.
 * Ошибка шага красится как провал — проверка не состоялась, и это повод
 * смотреть, а не пропускать; пропущенный шаг — справочная строка.
 */
const STATUS_VIEW: Record<CheckStatus, {tone: StatusPillTone; text: string}> = {
  pass: {tone: 'pass', text: 'Пройдена'},
  fail: {tone: 'fail', text: 'Не пройдена'},
  warning: {tone: 'warning', text: 'Внимание'},
  error: {tone: 'fail', text: 'Ошибка'},
  skipped: {tone: 'neutral', text: 'Пропущена'},
};

export function VerificationReportCheckStatus({status}: {status: CheckStatus}) {
  const view = STATUS_VIEW[status];

  return <StatusPill tone={view.tone}>{view.text}</StatusPill>;
}
