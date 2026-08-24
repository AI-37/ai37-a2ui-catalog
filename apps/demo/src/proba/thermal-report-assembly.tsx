import React from 'react';
import type {ThermalReportProps} from '@ai37/a2ui-catalog-schemas';
import {Card, KitStyles} from '@ai37/a2ui-catalog-react/primitives';
import {ReportInputsCard} from './report-inputs-card';
import {ReportProtocolCard} from './report-protocol-card';
import {ReportVerdict} from './report-verdict';
import {ThermalAssumptions} from './thermal-assumptions';
import {ThermalChecks} from './thermal-checks';
import {ThermalConstructions} from './thermal-constructions';
import {ThermalLayersCard} from './thermal-layers-card';

/**
 * `ThermalReport` на примитивах. Режим задаёт наполнение, а не флаг: у одной
 * конструкции приходят «Проверки» и таблица слоёв, у списка — конструкции с
 * отклонениями, исключённые и допущения. Секция, которой в наполнении нет,
 * места на экране не занимает — поэтому каждая ветка отдельным компонентом с
 * ранним `return null`, а не тернарником в разметке.
 */
export function ThermalReportAssembly({props}: {props: ThermalReportProps}) {
  return (
    <section className="a2ui-kit" style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportVerdict verdict={props.verdict} />
          <ThermalChecks checks={props.checks} />
          <ThermalConstructions constructions={props.constructions} excluded={props.excluded} />
          <ThermalAssumptions assumptions={props.assumptions} />
        </div>
      </Card>

      <ThermalLayersCard table={props.layersTable} />
      <ReportInputsCard inputs={props.inputs} />
      <ReportProtocolCard protocol={props.protocol} />
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
