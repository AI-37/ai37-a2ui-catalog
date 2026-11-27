import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {keoReportDefinition, type KeoReportAction} from '@ai37/a2ui-catalog-schemas';
import {KeoReportInputsCard} from './keo-report-inputs';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import {KeoReportProtocolCard} from './keo-report-protocol';
import {KeoReportRecommendationsSection} from './keo-report-recommendations';
import {KeoReportRoomsSection} from './keo-report-rooms';
import {KEO_REPORT_CSS, KEO_REPORT_STYLE_HREF} from './keo-report-styles';
import {KeoReportVerdictSection} from './keo-report-verdict';
import {StyleTag} from './style-tag';
import {useA2uiBaseStyles} from './shared';

/**
 * Результат расчёта КЕО карточками: вердикт, «что изменить» карточками
 * вариантов, результаты по помещениям, допущения, исходные данные по
 * источникам и протокол одной строкой со «Скачать». Компонент read-mostly:
 * единственная интерактивность — кнопки-действия, каждая диспатчит
 * `{event: {name, context: payload}}` агенту; весь контент приходит готовыми
 * строками, нормативная логика (допуск −10 % по СП 367 п. А.2.12, источник
 * нормы) остаётся у агента.
 */
export const KeoReport = createComponentImplementation(keoReportDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const handleAction = (action: KeoReportAction) => {
    void context.dispatchAction({
      event: {name: action.name, context: action.payload ?? {}},
    });
  };

  return (
    <div className="a2ui-kr">
      <StyleTag href={KEO_REPORT_STYLE_HREF} css={KEO_REPORT_CSS} />
      <div className="a2ui-kr__card">
        <KeoReportVerdictSection verdict={props.verdict} />
        {props.recommendations ? (
          <KeoReportRecommendationsSection
            recommendations={props.recommendations}
            onAction={handleAction}
          />
        ) : null}
        {props.rooms ? (
          <KeoReportRoomsSection rooms={props.rooms} onAction={handleAction} />
        ) : null}
        {props.assumptions ? (
          <section className="a2ui-kr__section">
            <div className="a2ui-kr__note">
              <span className="a2ui-kr__note-dot" aria-hidden="true" />
              <span>{renderLabelSubscripts(props.assumptions.join(' · '))}</span>
            </div>
          </section>
        ) : null}
      </div>
      <KeoReportInputsCard inputs={props.inputs} onAction={handleAction} />
      {props.protocol ? <KeoReportProtocolCard protocol={props.protocol} /> : null}
    </div>
  );
});
