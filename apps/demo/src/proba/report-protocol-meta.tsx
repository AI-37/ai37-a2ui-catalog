import React from 'react';

/** Мета протокола: «ГОСТ Р 52941-2008 · Прил. А · 12 шагов». Нет меты — нет строки. */
export function ReportProtocolMeta({meta}: {meta: string | undefined}) {
  if (meta === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{meta}</span>;
}
