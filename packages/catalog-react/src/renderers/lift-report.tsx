import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {liftReportDefinition, type LiftReportAction} from '@ai37/a2ui-catalog-schemas';
import {StyleTag} from './style-tag';
import {LiftReportInputsCard} from './lift-report-inputs';
import {LiftReportProtocolCard} from './lift-report-protocol';
import {LIFT_REPORT_CSS, LIFT_REPORT_STYLE_HREF} from './lift-report-styles';
import {LiftReportSuggestionsSection} from './lift-report-suggestions';
import {LiftReportVerdictSection} from './lift-report-verdict';
import {useA2uiBaseStyles} from './shared';

/**
 * Результат расчёта лифтов (ГОСТ Р 52941-2008 / ГОСТ 34758-2021) карточками
 * вместо markdown-простыни: вердикт, «Что изменить» с пересчитанными
 * вариантами, исходные данные по источникам, протокол под катом со «Скачать».
 * Компонент read-mostly: единственная интерактивность — кнопки-действия, каждая
 * диспатчит `{event: {name, context: payload}}` агенту; весь контент приходит
 * готовыми строками (наполнение — по наличию секций, см. схему).
 */
export const LiftReport = createComponentImplementation(liftReportDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const handleAction = (action: LiftReportAction) => {
    void context.dispatchAction({
      event: {name: action.name, context: action.payload ?? {}},
    });
  };

  return (
    <div className="a2ui-lr">
      <StyleTag href={LIFT_REPORT_STYLE_HREF} css={LIFT_REPORT_CSS} />
      <div className="a2ui-lr__card">
        <LiftReportVerdictSection verdict={props.verdict} />
        {props.suggestions ? (
          <LiftReportSuggestionsSection suggestions={props.suggestions} onAction={handleAction} />
        ) : null}
      </div>
      <LiftReportInputsCard inputs={props.inputs} onAction={handleAction} />
      {props.protocol ? <LiftReportProtocolCard protocol={props.protocol} /> : null}
    </div>
  );
});
