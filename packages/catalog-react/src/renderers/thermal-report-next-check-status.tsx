import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from '../primitives';
import {reportNextStatusText} from './report-next-status-text';
import {useA2uiMessages} from '../i18n';

/** Статус проверки. `info` — справочная строка, статуса у неё нет. */
export function ThermalReportNextCheckStatus({status}: {status: ThermalReportCheck['status']}) {
  const m = useA2uiMessages();
  if (status === 'info') {
    return null;
  }

  return <StatusPill tone={status}>{reportNextStatusText(status, m)}</StatusPill>;
}
