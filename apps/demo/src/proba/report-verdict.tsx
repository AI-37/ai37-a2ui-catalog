import React from 'react';
import {ReportHeadline} from './report-headline';
import {ReportSummary} from './report-summary';
import {StatusPill} from './status-pill';
import type {ReportVerdict as Verdict} from './report-assembly.types';

/**
 * Вердикт отчёта: статусная пилюля, serif-заголовок, подстрока. Один на оба
 * отчёта — у теплотеха и лифтов это буквально одна и та же шапка.
 */
export function ReportVerdict({verdict}: {verdict: Verdict}) {
  return (
    <section style={verdictStyle}>
      <StatusPill tone={verdict.status} size="badge">
        {verdict.badge}
      </StatusPill>
      <ReportHeadline>{verdict.headline}</ReportHeadline>
      <ReportSummary summary={verdict.summary} />
    </section>
  );
}

const verdictStyle: React.CSSProperties = {display: 'grid', gap: 10, justifyItems: 'start'};
