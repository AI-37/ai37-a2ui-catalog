import React from 'react';

/** Мета таблицы слоёв: «условия эксплуатации А». Нет меты — нет строки. */
export function ThermalReportNextLayersMeta({meta}: {meta: string | undefined}) {
  if (meta === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{meta}</span>;
}
