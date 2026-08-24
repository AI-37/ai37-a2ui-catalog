import React from 'react';
import type {ThermalReportConstruction, ThermalReportExcluded} from '@ai37/a2ui-catalog-schemas';
import {DeviationChip} from './deviation-chip';
import {ReportActionButton} from './report-action-button';
import {ReportRow} from './report-row';
import {ReportSection} from './report-section';
import {ThermalExcludedRow} from './thermal-excluded-row';

/**
 * «Конструкции» — режим списка: отклонение чипом и «Подобрать» у непроходящих,
 * строка исключённых в конце. Тона рамки у строки нет: пять красных рамок
 * подряд перестают что-либо означать, а об отклонении говорит правый слот.
 */
export function ThermalConstructions({
  constructions,
  excluded,
}: {
  constructions: ThermalReportConstruction[] | undefined;
  excluded: ThermalReportExcluded | undefined;
}) {
  if (constructions === undefined) {
    return null;
  }

  return (
    <ReportSection label="Конструкции">
      {constructions.map(construction => (
        <ReportRow
          key={construction.id}
          title={construction.name}
          detail={construction.detail}
          side={
            <>
              <DeviationChip pct={construction.deviationPct} />
              <ReportActionButton action={construction.action} weight="outline" />
            </>
          }
        />
      ))}
      <ThermalExcludedRow excluded={excluded} />
    </ReportSection>
  );
}
