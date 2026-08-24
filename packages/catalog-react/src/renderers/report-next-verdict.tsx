import React from 'react';
import {ReportHeadline, StatusPill} from '../primitives';
import {ReportNextSummary} from './report-next-summary';
import type {ReportNextVerdict} from './report-next.types';

/**
 * Вердикт отчёта: статусная пилюля, serif-заголовок, подстрока. Один на оба
 * отчёта — у теплотеха и лифтов это буквально одна и та же шапка.
 */
export function ReportNextVerdictSection({verdict}: {verdict: ReportNextVerdict}) {
  return (
    <section style={verdictStyle}>
      <StatusPill tone={verdict.status} size="badge">
        {verdict.badge}
      </StatusPill>
      <ReportHeadline>{verdict.headline}</ReportHeadline>
      <ReportNextSummary summary={verdict.summary} />
    </section>
  );
}

const verdictStyle: React.CSSProperties = {display: 'grid', gap: 10, justifyItems: 'start'};
