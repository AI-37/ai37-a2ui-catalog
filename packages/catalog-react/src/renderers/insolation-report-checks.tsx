import React from 'react';
import type {InsolationReportCheck} from '@ai37/a2ui-catalog-schemas';
import {InsolationReportActionButton} from './insolation-report-action-button';
import type {InsolationReportOnAction} from './insolation-report.types';

const STATUS_TEXT = {
  pass: 'Соответствует',
  fail: 'Не соответствует',
} as const;

/**
 * Блок «ПРОВЕРКИ» по СанПиН: продолжительность, максимальный непрерывный
 * период и справочные строки со `status: 'info'` (например «по квартире —
 * считается на уровне проекта») с кнопкой перехода. Тексты и статусы приходят
 * готовыми — ветвь прерывистой инсоляции выбирает агент.
 */
export function InsolationReportChecksSection({
  checks,
  onAction,
}: {
  checks: InsolationReportCheck[];
  onAction: InsolationReportOnAction;
}) {
  return (
    <section className="a2ui-ir__section">
      <p className="a2ui-ir__list-label">Проверки</p>
      <div className="a2ui-ir__rows">
        {checks.map((check, index) => (
          <div key={`${check.title}-${index}`} className="a2ui-ir__row">
            <div className="a2ui-ir__row-main">
              <span className="a2ui-ir__row-title">{check.title}</span>
              {check.detail ? <span className="a2ui-ir__row-detail">{check.detail}</span> : null}
            </div>
            <span className="a2ui-ir__row-side">
              <span className={`a2ui-ir__status a2ui-ir__status--${check.status}`}>
                <span className="a2ui-ir__dot" aria-hidden="true" />
                {check.status === 'info' ? null : STATUS_TEXT[check.status]}
              </span>
              {check.action ? (
                <InsolationReportActionButton
                  action={check.action}
                  variant="link"
                  onAction={onAction}
                />
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
