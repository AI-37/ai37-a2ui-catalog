import React from 'react';
import {LiftReportAssembly} from './lift-report-assembly';
import {ThermalReportAssembly} from './thermal-report-assembly';
import type {ReportAssemblyBlock} from './report-assembly.types';

/** Какой из двух отчётов собирать. Ветка одна, и она по виду наполнения. */
export function ReportBlock({block}: {block: ReportAssemblyBlock}) {
  if (block.kind === 'thermal') {
    return <ThermalReportAssembly props={block.props} />;
  }

  return <LiftReportAssembly props={block.props} />;
}
