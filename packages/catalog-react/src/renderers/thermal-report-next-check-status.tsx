import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from '../primitives';
import {REPORT_NEXT_STATUS_TEXT} from './report-next-status-text';

/** Статус проверки. `info` — справочная строка, статуса у неё нет. */
export function ThermalReportNextCheckStatus({status}: {status: ThermalReportCheck['status']}) {
  if (status === 'info') {
    return null;
  }

  return <StatusPill tone={status}>{REPORT_NEXT_STATUS_TEXT[status]}</StatusPill>;
}
