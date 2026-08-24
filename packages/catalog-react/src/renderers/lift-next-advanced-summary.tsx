import React from 'react';
import {buildLiftSectionSummary} from './build-lift-section-summary';
import type {LiftNextAdvancedSummaryProps} from './lift-next.types';

/**
 * Сводка свёрнутого блока дефолтов. Собирается из живых значений: присланная
 * строкой разъехалась бы после первой правки.
 */
export function LiftNextAdvancedSummary({fields, values}: LiftNextAdvancedSummaryProps) {
  return (
    <span className="a2ui-t--sub a2ui-t--muted">{buildLiftSectionSummary(fields, values)}</span>
  );
}
