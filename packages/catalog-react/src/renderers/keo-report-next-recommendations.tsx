import React from 'react';
import type {KeoReportRecommendation} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {KeoReportNextRecommendationSide} from './keo-report-next-recommendation-side';
import {ReportNextSection} from './report-next-section';
import type {ReportNextActionSink} from './report-next.types';

/**
 * «Что изменить»: варианты исправления с уже посчитанным результатом.
 * Рекомендованный (`tone: 'success'`) выделен акцентной рамкой — это
 * единственная строка отчёта, которой тон рамки положен: она предлагает
 * действие, а не сообщает статус. Непроходящий вариант рамки не красит:
 * о нём говорит правый слот, а список красных рамок читаться перестаёт.
 */
export function KeoReportNextRecommendations({
  recommendations,
  onAction,
}: {
  recommendations: KeoReportRecommendation[] | undefined;
  onAction: ReportNextActionSink;
}) {
  if (recommendations === undefined) {
    return null;
  }

  return (
    <ReportNextSection label="Что изменить">
      {recommendations.map((recommendation, index) => (
        <ReportRow
          key={`${recommendation.title}-${index}`}
          title={recommendation.title}
          detail={recommendation.detail}
          tone={recommendation.tone === 'success' ? 'accent' : 'neutral'}
          side={
            <KeoReportNextRecommendationSide
              recommendation={recommendation}
              onAction={onAction}
            />
          }
        />
      ))}
    </ReportNextSection>
  );
}
