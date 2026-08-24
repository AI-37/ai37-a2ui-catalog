import React from 'react';
import type {LiftReportProps} from '@ai37/a2ui-catalog-schemas';
import {Card, KitStyles} from '@ai37/a2ui-catalog-react/primitives';
import {LiftSuggestions} from './lift-suggestions';
import {ReportInputsCard} from './report-inputs-card';
import {ReportProtocolCard} from './report-protocol-card';
import {ReportVerdict} from './report-verdict';

/**
 * `LiftReport` на примитивах. Из четырёх секций три — те же компоненты, что у
 * теплотеха: вердикт, исходные данные и протокол здесь не переписаны, а взяты
 * готовыми. Своё у отчёта только «Что изменить».
 */
export function LiftReportAssembly({props}: {props: LiftReportProps}) {
  return (
    <section className="a2ui-kit" style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportVerdict verdict={props.verdict} />
          <LiftSuggestions suggestions={props.suggestions} />
        </div>
      </Card>

      <ReportInputsCard inputs={props.inputs} />
      <ReportProtocolCard protocol={props.protocol} />
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
