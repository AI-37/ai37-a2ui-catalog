import React from 'react';
import {Card} from './card';
import {ReportRowDetail} from './report-row-detail';
import type {ReportRowProps} from './report-row.types';

/**
 * Строка списка отчёта: слот `main` (титул + пояснение) и слот `side`.
 * Рама — `Card`, поэтому уровень фона и радиус считает набор, а не строка.
 */
export function ReportRow({title, detail, side, tone = 'neutral'}: ReportRowProps) {
  return (
    <Card className={tone === 'accent' ? 'a2ui-card--accent' : undefined}>
      <div className="a2ui-row">
        <span className="a2ui-row__main">
          <span className="a2ui-t--body a2ui-t--strong">{title}</span>
          <ReportRowDetail detail={detail} />
        </span>
        <span className="a2ui-row__side">{side}</span>
      </div>
    </Card>
  );
}
