import React from 'react';

/** Пояснение строки. Нет пояснения — нет и пустой второй строки в сетке. */
export function ReportRowDetail({detail}: {detail: string | undefined}) {
  if (detail === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{detail}</span>;
}
