import React from 'react';
import type {KeoReportRecommendation} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from '../primitives';
import {KEO_REPORT_NEXT_STATUS} from './keo-report-next-recommendation-tone';
import {ReportNextActionButton} from './report-next-action-button';
import {REPORT_NEXT_STATUS_TEXT} from './report-next-status-text';
import type {ReportNextActionSink} from './report-next.types';

/**
 * Правый слот варианта «Что изменить»: кнопка принятия либо состояние тоном
 * варианта — тот же порядок, что у лифтов. Оба сразу не приходят: вариант,
 * который не закрывает дефицит, принимать нечем, а у принимаемого о запасе
 * говорит сам `detail` («проходит с запасом 4 %»).
 *
 * Слово состояния зашито: `success | fail` — перечисление, и разрешить
 * агенту выбирать для него слово значит разрешить трём отчётам говорить об
 * одном и том же по-разному. У `neutral` слова нет вовсе: своего
 * `statusLabel` схема КЕО не заводит, а выдумывать его рендерер не станет.
 */
export function KeoReportNextRecommendationSide({
  recommendation,
  onAction,
}: {
  recommendation: KeoReportRecommendation;
  onAction: ReportNextActionSink;
}) {
  if (recommendation.action !== undefined) {
    return (
      <ReportNextActionButton action={recommendation.action} weight="outline" onAction={onAction} />
    );
  }

  if (recommendation.tone === 'neutral') {
    return null;
  }

  const status = KEO_REPORT_NEXT_STATUS[recommendation.tone];

  return <StatusPill tone={status}>{REPORT_NEXT_STATUS_TEXT[status]}</StatusPill>;
}
