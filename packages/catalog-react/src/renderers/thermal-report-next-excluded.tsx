import React from 'react';
import type {ThermalReportExcluded} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import type {ReportNextActionSink} from './report-next.types';

/** Строка исключённых из расчёта конструкций — последняя в списке. */
export function ThermalReportNextExcluded({
  excluded,
  onAction,
}: {
  excluded: ThermalReportExcluded | undefined;
  onAction: ReportNextActionSink;
}) {
  if (excluded === undefined) {
    return null;
  }

  return (
    <ReportRow
      title={excluded.title}
      detail={excluded.detail}
      side={<ReportNextActionButton action={excluded.action} weight="link" onAction={onAction} />}
    />
  );
}
