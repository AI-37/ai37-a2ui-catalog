import React from 'react';
import type {LiftReportSuggestions} from '@ai37/a2ui-catalog-schemas';
import {LiftReportActionButton} from './lift-report-action-button';
import type {LiftReportOnAction} from './lift-report.types';

/**
 * Блок «Что изменить»: варианты с уже пересчитанным результатом в `detail`.
 * `action` рендерит кнопку «Пересчитать» (принять вариант), без действия —
 * `statusLabel` тоном варианта (`fail` — danger «не проходит»). `tone: 'pass'`
 * выделяет рекомендуемый вариант акцентной рамкой.
 */
export function LiftReportSuggestionsSection({
  suggestions,
  onAction,
}: {
  suggestions: LiftReportSuggestions;
  onAction: LiftReportOnAction;
}) {
  return (
    <section className="a2ui-lr__section">
      <p className="a2ui-lr__list-label">{suggestions.title ?? 'Что изменить'}</p>
      <div className="a2ui-lr__rows">
        {suggestions.items.map(item => (
          <div key={item.id} className={`a2ui-lr__row a2ui-lr__row--${item.tone}`}>
            <div className="a2ui-lr__row-main">
              <span className="a2ui-lr__row-title">{item.title}</span>
              {item.detail ? <span className="a2ui-lr__row-detail">{item.detail}</span> : null}
            </div>
            <div className="a2ui-lr__row-side">
              {item.action ? (
                <LiftReportActionButton
                  action={item.action}
                  variant="outline"
                  onAction={onAction}
                />
              ) : item.statusLabel ? (
                <span className={`a2ui-lr__status a2ui-lr__status--${item.tone}`}>
                  {item.statusLabel}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
