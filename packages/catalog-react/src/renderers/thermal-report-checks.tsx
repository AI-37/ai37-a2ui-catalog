import React from 'react';
import type {ThermalReportCheck} from '@ai37/a2ui-catalog-schemas';

const STATUS_TEXT = {
  pass: 'Соответствует',
  fail: 'Не соответствует',
} as const;

/** Блок «ПРОВЕРКИ» (режим одной конструкции): строки со статусом справа;
 * `info` — строка без статуса (справочная, например про kоб). */
export function ThermalReportChecksSection({checks}: {checks: ThermalReportCheck[]}) {
  return (
    <section className="a2ui-tr__section">
      <p className="a2ui-tr__list-label">Проверки</p>
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
                {STATUS_TEXT[check.status]}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
