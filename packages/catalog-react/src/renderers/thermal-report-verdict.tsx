import React from 'react';
import type {ThermalReportVerdict} from '@ai37/a2ui-catalog-schemas';

/** Шапка отчёта: статусный бейдж, крупный serif-заголовок, подстрока. */
export function ThermalReportVerdictSection({verdict}: {verdict: ThermalReportVerdict}) {
  return (
    <section className="a2ui-tr__section">
      <span className={`a2ui-tr__badge a2ui-tr__badge--${verdict.status}`}>
        <span className="a2ui-tr__dot" aria-hidden="true" />
        {verdict.badge}
      </span>
      <h3 className="a2ui-tr__headline">{verdict.headline}</h3>
      {verdict.summary ? <p className="a2ui-tr__summary">{verdict.summary}</p> : null}
    </section>
  );
}
