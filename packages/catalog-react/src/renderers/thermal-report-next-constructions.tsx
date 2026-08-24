import React from 'react';
import type {ThermalReportConstruction, ThermalReportExcluded} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import {ReportNextSection} from './report-next-section';
import {ThermalReportNextDeviation} from './thermal-report-next-deviation';
import {ThermalReportNextExcluded} from './thermal-report-next-excluded';
import type {ReportNextActionSink} from './report-next.types';

/**
 * «Конструкции» — режим списка: отклонение чипом и «Подобрать» у непроходящих,
 * строка исключённых в конце. Тона рамки у строки нет: пять красных рамок
 * подряд перестают что-либо означать, а об отклонении говорит правый слот.
 */
export function ThermalReportNextConstructions({
  constructions,
  excluded,
  onAction,
}: {
  constructions: ThermalReportConstruction[] | undefined;
  excluded: ThermalReportExcluded | undefined;
  onAction: ReportNextActionSink;
}) {
  if (constructions === undefined) {
    return null;
  }

  return (
    <ReportNextSection label="Конструкции">
      {constructions.map(construction => (
        <ReportRow
          key={construction.id}
          title={construction.name}
          detail={construction.detail}
          side={
            <>
              <ThermalReportNextDeviation pct={construction.deviationPct} />
              <ReportNextActionButton
                action={construction.action}
                weight="outline"
                onAction={onAction}
              />
            </>
          }
        />
      ))}
      <ThermalReportNextExcluded excluded={excluded} onAction={onAction} />
    </ReportNextSection>
  );
}
