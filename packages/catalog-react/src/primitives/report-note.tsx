import React from 'react';

/** Заметка с точкой на утопленном фоне: допущения и оговорка группы. */
export function ReportNote({children}: {children: React.ReactNode}) {
  return (
    <div className="a2ui-note a2ui-t--sub">
      <span className="a2ui-note__dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
