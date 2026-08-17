import React from 'react';
import type {KeoReportVerdict} from '@ai37/a2ui-catalog-schemas';

/** Шапка отчёта: статусный бейдж, крупный serif-заголовок, подстрока. */
export function KeoReportVerdictSection({verdict}: {verdict: KeoReportVerdict}) {
  return (
    <section className="a2ui-kr__section">
      <span className={`a2ui-kr__badge a2ui-kr__badge--${verdict.status}`}>
        <span className="a2ui-kr__dot" aria-hidden="true" />
        {verdict.badge}
      </span>
      <h3 className="a2ui-kr__headline">{verdict.headline}</h3>
      {verdict.summary ? <p className="a2ui-kr__summary">{verdict.summary}</p> : null}
    </section>
  );
}
