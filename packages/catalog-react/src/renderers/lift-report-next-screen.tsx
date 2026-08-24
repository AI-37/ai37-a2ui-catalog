import React from 'react';
import type {LiftReportProps} from '@ai37/a2ui-catalog-schemas';
import {Card, KIT_SCOPE, KitStyles} from '../primitives';
import {LiftReportNextSuggestions} from './lift-report-next-suggestions';
import {ReportNextInputsCard} from './report-next-inputs-card';
import {ReportNextProtocolCard} from './report-next-protocol';
import {ReportNextVerdictSection} from './report-next-verdict';
import type {ReportNextActionSink} from './report-next.types';

/**
 * Экран лифтового отчёта на примитивах. Из четырёх секций три — те же
 * компоненты, что у теплотеха: вердикт, исходные данные и протокол здесь не
 * переписаны, а взяты готовыми. Своё у отчёта только «Что изменить».
 *
 * Отдельно от рендерера по той же причине, что у теплотеха: страница
 * песочницы ставит его без a2ui-хоста, наружу — один `onAction`.
 */
export function LiftReportNextScreen({
  props,
  onAction,
}: {
  props: LiftReportProps;
  onAction: ReportNextActionSink;
}) {
  return (
    <div className={KIT_SCOPE} style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportNextVerdictSection verdict={props.verdict} />
          <LiftReportNextSuggestions suggestions={props.suggestions} onAction={onAction} />
        </div>
      </Card>

      <ReportNextInputsCard inputs={props.inputs} onAction={onAction} />
      <ReportNextProtocolCard protocol={props.protocol} />
    </div>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
