import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';
import {useA2uiMessages} from '../i18n';

/** Блок «ПРОВЕРКИ» (режим одной конструкции): строки со статусом справа;
 * `info` — строка без статуса (справочная, например про kоб). */
export function ThermalReportChecksSection({checks}: {checks: ThermalReportCheck[]}) {
  const m = useA2uiMessages();
  return (
    <section className="a2ui-tr__section">
      <p className="a2ui-tr__list-label">{m.report.checks}</p>
      <div className="a2ui-tr__rows">
        {checks.map((check, index) => (
          <div key={`${check.title}-${index}`} className="a2ui-tr__row">
            <div className="a2ui-tr__row-main">
              <span className="a2ui-tr__row-title">{check.title}</span>
              {check.detail ? <span className="a2ui-tr__row-detail">{check.detail}</span> : null}
            </div>
            {check.status !== 'info' ? (
              <span className={`a2ui-tr__status a2ui-tr__status--${check.status}`}>
                <span className="a2ui-tr__dot" aria-hidden="true" />
                {m.report[check.status]}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
