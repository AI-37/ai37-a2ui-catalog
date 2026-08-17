import React from 'react';
import type {LiftReportVerdict} from '@ai37/a2ui-catalog-schemas';

/** Шапка отчёта: статусный бейдж с точкой, крупный serif-заголовок
 * («Интервал движения — 220 с»), подстрока с нормой. */
export function LiftReportVerdictSection({verdict}: {verdict: LiftReportVerdict}) {
  return (
    <section className="a2ui-lr__section">
      <span className={`a2ui-lr__badge a2ui-lr__badge--${verdict.status}`}>
        <span className="a2ui-lr__dot" aria-hidden="true" />
        {verdict.badge}
      </span>
      <h3 className="a2ui-lr__headline">{verdict.headline}</h3>
      {verdict.summary ? <p className="a2ui-lr__summary">{verdict.summary}</p> : null}
    </section>
  );
}
