import React from 'react';
import type {ThermalReportExcluded} from '@ai37/a2ui-catalog-schemas';
import {ReportActionButton} from './report-action-button';
import {ReportRow} from './report-row';

/** Строка исключённых из расчёта конструкций — последняя в списке. */
export function ThermalExcludedRow({excluded}: {excluded: ThermalReportExcluded | undefined}) {
  if (excluded === undefined) {
    return null;
  }

  return (
    <ReportRow
      title={excluded.title}
      detail={excluded.detail}
      side={<ReportActionButton action={excluded.action} weight="link" />}
    />
  );
}
