import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {thermalReportDefinition, type ThermalReportAction} from '@ai37/a2ui-catalog-schemas';
import {StyleTag} from './style-tag';
import {ThermalReportChecksSection} from './thermal-report-checks';
import {ThermalReportConstructionsSection} from './thermal-report-constructions';
import {ThermalReportInputsCard} from './thermal-report-inputs';
import {ThermalReportLayersTableCard} from './thermal-report-layers-table';
import {ThermalReportProtocolCard} from './thermal-report-protocol';
import {THERMAL_REPORT_CSS, THERMAL_REPORT_STYLE_HREF} from './thermal-report-styles';
import {ThermalReportVerdictSection} from './thermal-report-verdict';
import {useA2uiBaseStyles} from './shared';

/**
 * Результат теплотехнического расчёта (СП 50.13330) карточками: вердикт +
 * проверки (одна конструкция) или список конструкций с отклонениями (много),
 * таблица слоёв, исходные данные по источникам, протокол под катом. Компонент
 * read-mostly: единственная интерактивность — кнопки-действия, каждая
 * диспатчит `{event: {name, context: payload}}` агенту; весь контент приходит
 * готовыми строками (режим — по наличию секций, см. схему).
 */
export const ThermalReport = createComponentImplementation(
  thermalReportDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const handleAction = (action: ThermalReportAction) => {
      void context.dispatchAction({
        event: {name: action.name, context: action.payload ?? {}},
      });
    };

    return (
      <div className="a2ui-tr">
        <StyleTag href={THERMAL_REPORT_STYLE_HREF} css={THERMAL_REPORT_CSS} />
        <div className="a2ui-tr__card">
          <ThermalReportVerdictSection verdict={props.verdict} />
          {props.checks ? <ThermalReportChecksSection checks={props.checks} /> : null}
          {props.constructions ? (
            <ThermalReportConstructionsSection
              constructions={props.constructions}
              excluded={props.excluded}
              onAction={handleAction}
            />
          ) : null}
          {props.assumptions ? (
            <section className="a2ui-tr__section">
              <div className="a2ui-tr__note">
                <span className="a2ui-tr__note-dot" aria-hidden="true" />
                <span>{props.assumptions.join(' · ')}</span>
              </div>
            </section>
          ) : null}
        </div>
        {props.layersTable ? <ThermalReportLayersTableCard table={props.layersTable} /> : null}
        <ThermalReportInputsCard inputs={props.inputs} onAction={handleAction} />
        {props.protocol ? <ThermalReportProtocolCard protocol={props.protocol} /> : null}
      </div>
    );
  },
);
