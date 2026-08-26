import React from 'react';
import type {KeoReportProps} from '@ai37/a2ui-catalog-schemas';
import {Card, KIT_SCOPE, KitStyles} from '../primitives';
import {KeoReportNextRecommendations} from './keo-report-next-recommendations';
import {KeoReportNextRooms} from './keo-report-next-rooms';
import {ReportNextAssumptions} from './report-next-assumptions';
import {ReportNextInputsCard} from './report-next-inputs-card';
import {ReportNextProtocolCard} from './report-next-protocol';
import {ReportNextVerdictSection} from './report-next-verdict';
import type {ReportNextActionSink} from './report-next.types';

/**
 * Экран отчёта КЕО на примитивах. Из пяти секций три — те же компоненты, что
 * у теплотеха и лифтов: вердикт, исходные данные и протокол здесь не
 * переписаны, а взяты готовыми; допущения — общая заметка. Своих у КЕО две:
 * «Что изменить» карточками вариантов и «Помещения».
 *
 * Отдельно от рендерера по той же причине, что у двух других отчётов:
 * страница песочницы ставит его без a2ui-хоста, наружу — один `onAction`.
 */
export function KeoReportNextScreen({
  props,
  onAction,
}: {
  props: KeoReportProps;
  onAction: ReportNextActionSink;
}) {
  return (
    <div className={KIT_SCOPE} style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportNextVerdictSection verdict={props.verdict} />
          <KeoReportNextRecommendations
            recommendations={props.recommendations}
            onAction={onAction}
          />
          <KeoReportNextRooms rooms={props.rooms} onAction={onAction} />
          <ReportNextAssumptions assumptions={props.assumptions} />
        </div>
      </Card>

      <ReportNextInputsCard inputs={props.inputs} onAction={onAction} />
      <ReportNextProtocolCard protocol={props.protocol} />
    </div>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
