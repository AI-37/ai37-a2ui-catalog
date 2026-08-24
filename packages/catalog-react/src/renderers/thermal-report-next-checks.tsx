import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {ReportNextSection} from './report-next-section';
import {ThermalReportNextCheckStatus} from './thermal-report-next-check-status';

/** «Проверки» — режим одной конструкции. Нет проверок — секция не занимает места. */
export function ThermalReportNextChecks({checks}: {checks: ThermalReportCheck[] | undefined}) {
  if (checks === undefined) {
    return null;
  }

  return (
    <ReportNextSection label="Проверки">
      {checks.map((check, index) => (
        <ReportRow
          key={`${check.title}-${index}`}
          title={check.title}
          detail={check.detail}
          side={<ThermalReportNextCheckStatus status={check.status} />}
        />
      ))}
    </ReportNextSection>
  );
}
