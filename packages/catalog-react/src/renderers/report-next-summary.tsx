import React from 'react';

/** Подстрока вердикта. Нет её — вердикт заканчивается заголовком. */
export function ReportNextSummary({summary}: {summary: string | undefined}) {
  if (summary === undefined) {
    return null;
  }

  return (
    <p className="a2ui-t--body a2ui-t--muted" style={summaryStyle}>
      {summary}
    </p>
  );
}

const summaryStyle: React.CSSProperties = {margin: 0, maxWidth: 640};
