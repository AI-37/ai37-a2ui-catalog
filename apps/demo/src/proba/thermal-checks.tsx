import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from './report-row';
import {ReportSection} from './report-section';
import {ThermalCheckStatus} from './thermal-check-status';

/** «Проверки» — режим одной конструкции. Нет проверок — секция не занимает места. */
export function ThermalChecks({checks}: {checks: ThermalReportCheck[] | undefined}) {
  if (checks === undefined) {
    return null;
  }

  return (
    <ReportSection label="Проверки">
      {checks.map((check, index) => (
        <ReportRow
          key={`${check.title}-${index}`}
          title={check.title}
          detail={check.detail}
          side={<ThermalCheckStatus status={check.status} />}
        />
      ))}
    </ReportSection>
  );
}
