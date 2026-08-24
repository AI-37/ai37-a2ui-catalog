import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from './status-pill';

/**
 * Слова статуса проверки. Зашиты в сборку, а не приходят строкой: состояние
 * названо перечислением, и давать агенту выбирать для него слово — значит
 * разрешить двум отчётам говорить об одном и том же по-разному.
 */
const STATUS_TEXT = {pass: 'Соответствует', fail: 'Не соответствует'} as const;

/** Статус проверки. `info` — справочная строка, статуса у неё нет. */
export function ThermalCheckStatus({status}: {status: ThermalReportCheck['status']}) {
  if (status === 'info') {
    return null;
  }

  return <StatusPill tone={status}>{STATUS_TEXT[status]}</StatusPill>;
}
