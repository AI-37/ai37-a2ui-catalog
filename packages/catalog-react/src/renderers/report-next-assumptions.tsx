import React from 'react';
import {ReportNote} from '../primitives';

/** Допущения расчёта одной заметкой: их два-три и читаются они подряд. */
export function ReportNextAssumptions({assumptions}: {assumptions: string[] | undefined}) {
  if (assumptions === undefined) {
    return null;
  }

  return <ReportNote>{assumptions.join(' · ')}</ReportNote>;
}
