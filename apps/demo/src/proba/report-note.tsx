import React from 'react';
import {PROBA_REPORT_NOTE_CSS} from './report-note-css';

/** Заметка с точкой на утопленном фоне: допущения и оговорка группы. */
export function ReportNote({children}: {children: React.ReactNode}) {
  return (
    <>
      <style href="proba-report-note" precedence="default">
        {PROBA_REPORT_NOTE_CSS}
      </style>
      <div className="a2ui-note a2ui-t--sub">
        <span className="a2ui-note__dot" aria-hidden="true" />
        <span>{children}</span>
      </div>
    </>
  );
}
