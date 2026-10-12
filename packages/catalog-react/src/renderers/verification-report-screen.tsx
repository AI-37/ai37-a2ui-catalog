import React from 'react';
import type {VerificationReportProps} from '@ai37/a2ui-catalog-schemas';
import {Card, KIT_SCOPE, KitStyles, ReportNote} from '../primitives';
import {ReportNextVerdictSection} from './report-next-verdict';
import {VerificationReportChecks} from './verification-report-checks';

/**
 * Экран проверки контрагента. Отдельно от рендерера, чтобы его можно было
 * поставить на страницу без a2ui-хоста (demo): ни контекста, ни действий
 * экрану не нужно.
 */
export function VerificationReportScreen({props}: {props: VerificationReportProps}) {
  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ReportNextVerdictSection verdict={props.verdict} />
          <VerificationReportChecks checks={props.checks} />
          <VerificationReportNote note={props.note} />
        </div>
      </Card>
    </div>
  );
}

/** Пояснение без проверок: ИНН не найден или контрагент исключён до пайплайна. */
function VerificationReportNote({note}: {note: string | undefined}) {
  if (note === undefined) {
    return null;
  }

  return <ReportNote>{note}</ReportNote>;
}

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};
