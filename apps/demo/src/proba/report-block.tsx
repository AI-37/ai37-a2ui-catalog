import React from 'react';
import {KeoReportNextScreen} from '../../../../packages/catalog-react/src/renderers/keo-report-next-screen';
import {LiftReportNextScreen} from '../../../../packages/catalog-react/src/renderers/lift-report-next-screen';
import {ThermalReportNextScreen} from '../../../../packages/catalog-react/src/renderers/thermal-report-next-screen';
import {dispatchReportAction} from './dispatch-report-action';
import type {ReportAssemblyBlock} from './report-assembly.types';

/**
 * Какой из трёх отчётов собирать. Ветка одна, и она по виду наполнения.
 *
 * Экраны — те самые из пакета, а не их копии: части отчёта переехали в
 * `packages/catalog-react` вместе с рендерерами (change `reports-next`), и
 * второй экземпляр разошёлся бы с ними первой же правкой. Наружу вместо
 * `dispatchAction` — консоль: a2ui-контекста на странице нет.
 */
export function ReportBlock({block}: {block: ReportAssemblyBlock}) {
  if (block.kind === 'thermal') {
    return <ThermalReportNextScreen props={block.props} onAction={dispatchReportAction} />;
  }

  if (block.kind === 'keo') {
    return <KeoReportNextScreen props={block.props} onAction={dispatchReportAction} />;
  }

  return <LiftReportNextScreen props={block.props} onAction={dispatchReportAction} />;
}
