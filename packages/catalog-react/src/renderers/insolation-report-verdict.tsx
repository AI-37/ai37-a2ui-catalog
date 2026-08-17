import React from 'react';
import type {InsolationReportVerdict} from '@ai37/a2ui-catalog-schemas';

/** Шапка отчёта: статусный бейдж, крупный serif-заголовок, подстрока. */
export function InsolationReportVerdictSection({
  verdict,
}: {
  verdict: InsolationReportVerdict;
}) {
  return (
    <section className="a2ui-ir__section">
      <span className={`a2ui-ir__badge a2ui-ir__badge--${verdict.status}`}>
        <span className="a2ui-ir__dot" aria-hidden="true" />
        {verdict.badge}
      </span>
      <h3 className="a2ui-ir__headline">{verdict.headline}</h3>
      {verdict.summary ? <p className="a2ui-ir__summary">{verdict.summary}</p> : null}
    </section>
  );
}
