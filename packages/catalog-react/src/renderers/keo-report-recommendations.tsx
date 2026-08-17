import React from 'react';
import type {KeoReportRecommendation} from '@ai37/a2ui-catalog-schemas';
import {KeoReportActionButton} from './keo-report-action-button';
import type {KeoReportOnAction} from './keo-report.types';

/**
 * Секция «Что изменить» — единственная секция, которой нет у ThermalReport:
 * карточки вариантов исправления. `tone` управляет ТОЛЬКО оформлением
 * (success — акцентная рамка, fail — detail danger-цветом), а кнопка
 * появляется исключительно при `action`: агент волен сочетать тон и действие
 * как нужно (Решение 2 design.md).
 */
export function KeoReportRecommendationsSection({
  recommendations,
  onAction,
}: {
  recommendations: KeoReportRecommendation[];
  onAction: KeoReportOnAction;
}) {
  return (
    <section className="a2ui-kr__section">
      <p className="a2ui-kr__list-label">Что изменить</p>
      <div className="a2ui-kr__rows">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${recommendation.title}-${index}`}
            className={`a2ui-kr__card-option a2ui-kr__card-option--${recommendation.tone}`}
          >
            <div className="a2ui-kr__card-option-main">
              <span className="a2ui-kr__card-option-title">{recommendation.title}</span>
              <span className="a2ui-kr__card-option-detail">{recommendation.detail}</span>
            </div>
            {recommendation.action ? (
              <KeoReportActionButton
                action={recommendation.action}
                variant="solid"
                onAction={onAction}
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
