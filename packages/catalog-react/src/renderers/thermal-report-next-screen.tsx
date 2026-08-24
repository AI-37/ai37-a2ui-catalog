import React from 'react';
import {KIT_SCOPE, KitStyles} from '../primitives';
import {ReportNextInputsCard} from './report-next-inputs-card';
import {ReportNextProtocolCard} from './report-next-protocol';
import {ReportNextVerdictSection} from './report-next-verdict';
import {ThermalReportNextAssumptions} from './thermal-report-next-assumptions';
import {ThermalReportNextChecks} from './thermal-report-next-checks';
import {ThermalReportNextConstructions} from './thermal-report-next-constructions';
import {ThermalReportNextLayers} from './thermal-report-next-layers';
import {Card} from '../primitives';
import type {ThermalReportNextScreenProps} from './report-next.types';

/**
 * Экран теплотехнического отчёта на примитивах. Отдельно от рендерера, чтобы
 * его можно было поставить на страницу без a2ui-хоста (`/proba/report-assembly`):
 * наружу — один `onAction`, ни состояния, ни контекста экрану не нужно.
 *
 * Режим задаёт наполнение, а не флаг: у одной конструкции приходят «Проверки»
 * и таблица слоёв, у списка — конструкции с отклонениями, исключённые и
 * допущения. Секция, которой в наполнении нет, места на экране не занимает —
 * поэтому каждая ветка отдельным компонентом с ранним `return null`.
 */
export function ThermalReportNextScreen({props, onAction}: ThermalReportNextScreenProps) {
  return (
    <div className={KIT_SCOPE} style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportNextVerdictSection verdict={props.verdict} />
          <ThermalReportNextChecks checks={props.checks} />
          <ThermalReportNextConstructions
            constructions={props.constructions}
            excluded={props.excluded}
            onAction={onAction}
          />
          <ThermalReportNextAssumptions assumptions={props.assumptions} />
        </div>
      </Card>

      <ThermalReportNextLayers table={props.layersTable} />
      <ReportNextInputsCard inputs={props.inputs} onAction={onAction} />
      <ReportNextProtocolCard protocol={props.protocol} />
    </div>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
