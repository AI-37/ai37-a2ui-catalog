import React from 'react';
import type {VerificationReportCheckStatus as CheckStatus} from '@ai37/a2ui-catalog-schemas';
import {StatusPill, type StatusPillTone} from '../primitives';
import {useA2uiMessages} from '../i18n';

/**
 * Слова статуса зашиты в рендерер, а не приходят строкой (канон
 * `report-next-status-text`): статус — перечисление, и слово к нему одно.
 * Ошибка шага красится как провал — проверка не состоялась, и это повод
 * смотреть, а не пропускать; пропущенный шаг — справочная строка.
 */
const STATUS_TONE: Record<CheckStatus, StatusPillTone> = {
  pass: 'pass',
  fail: 'fail',
  warning: 'warning',
  error: 'fail',
  skipped: 'neutral',
};

export function VerificationReportCheckStatus({status}: {status: CheckStatus}) {
  const m = useA2uiMessages();

  return <StatusPill tone={STATUS_TONE[status]}>{m.verification[status]}</StatusPill>;
}
