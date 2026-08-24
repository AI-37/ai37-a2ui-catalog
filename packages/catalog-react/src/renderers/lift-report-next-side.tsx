import React from 'react';
import type {LiftReportSuggestion} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import {REPORT_NEXT_STATUS_TEXT} from './report-next-status-text';
import type {ReportNextActionSink} from './report-next.types';

/**
 * Правый слот варианта «Что изменить»: кнопка принятия либо статус тоном
 * варианта. Оба сразу не приходят — вариант, который не проходит, принимать
 * нечем.
 *
 * Слово статуса зашито там, где состояние сводится к перечислению
 * (`pass | fail`): иначе два отчёта говорили бы об одном и том же по-разному.
 * `statusLabel` агента чтится только у `neutral` — его перечисление не
 * покрывает.
 */
export function LiftReportNextSide({
  item,
  onAction,
}: {
  item: LiftReportSuggestion;
  onAction: ReportNextActionSink;
}) {
  if (item.action !== undefined) {
    return <ReportNextActionButton action={item.action} weight="outline" onAction={onAction} />;
  }

  if (item.tone !== 'neutral') {
    return <StatusPill tone={item.tone}>{REPORT_NEXT_STATUS_TEXT[item.tone]}</StatusPill>;
  }

  if (item.statusLabel !== undefined) {
    return <StatusPill tone="neutral">{item.statusLabel}</StatusPill>;
  }

  return null;
}
