import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {
  insolationReportDefinition,
  type InsolationReportAction,
} from '@ai37/a2ui-catalog-schemas';
import {InsolationReportChecksSection} from './insolation-report-checks';
import {InsolationReportInputsCard} from './insolation-report-inputs';
import {InsolationReportProtocolCard} from './insolation-report-protocol';
import {
  INSOLATION_REPORT_CSS,
  INSOLATION_REPORT_STYLE_HREF,
} from './insolation-report-styles';
import {InsolationReportTimelineSection} from './insolation-report-timeline';
import {InsolationReportVerdictSection} from './insolation-report-verdict';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';

/**
 * Результат расчёта инсоляции карточками: вердикт, суточный график
 * солнце/тень, проверки по СанПиН со статусами и переходами, плашки принятых
 * допущений, исходные данные по источникам и протокол одной строкой со
 * «Скачать». Компонент read-mostly: единственная интерактивность — кнопки
 * действий, каждая диспатчит `{event: {name, context: payload}}` агенту.
 * Нормативная логика (зона, нормируемый период, ветвь прерывистой инсоляции)
 * остаётся у агента; числа в props — только координаты полосы.
 */
export const InsolationReport = createComponentImplementation(
  insolationReportDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const handleAction = (action: InsolationReportAction) => {
      void context.dispatchAction({
        event: {name: action.name, context: action.payload ?? {}},
      });
    };

    return (
      <div className="a2ui-ir">
        <StyleTag href={INSOLATION_REPORT_STYLE_HREF} css={INSOLATION_REPORT_CSS} />
        <div className="a2ui-ir__card">
          <InsolationReportVerdictSection verdict={props.verdict} />
          {props.timeline ? (
            <InsolationReportTimelineSection timeline={props.timeline} />
          ) : null}
          {props.checks ? (
            <InsolationReportChecksSection checks={props.checks} onAction={handleAction} />
          ) : null}
          {props.assumptions ? (
            <section className="a2ui-ir__section">
              {props.assumptions.map((assumption: string) => (
                <div key={assumption} className="a2ui-ir__note">
                  <span className="a2ui-ir__note-dot" aria-hidden="true" />
                  <span>{assumption}</span>
                </div>
              ))}
            </section>
          ) : null}
        </div>
        <InsolationReportInputsCard inputs={props.inputs} onAction={handleAction} />
        {props.protocol ? <InsolationReportProtocolCard protocol={props.protocol} /> : null}
      </div>
    );
  },
);
