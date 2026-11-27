import React from 'react';
import {LiftReportNextScreen} from '../../../../packages/catalog-react/src/renderers/lift-report-next-screen';
import {ThermalReportNextScreen} from '../../../../packages/catalog-react/src/renderers/thermal-report-next-screen';
import {VerificationReportScreen} from '../../../../packages/catalog-react/src/renderers/verification-report-screen';
import {dispatchReportAction} from './dispatch-report-action';
import type {ReportAssemblyBlock} from './report-assembly.types';

/**
 * Какой отчёт собирать — по виду наполнения.
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

  if (block.kind === 'verification') {
    return <VerificationReportScreen props={block.props} />;
  }

  return <LiftReportNextScreen props={block.props} onAction={dispatchReportAction} />;
}
