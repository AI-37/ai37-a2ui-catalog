import React from 'react';
import type {LiftReportSuggestions} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {LiftReportNextSide} from './lift-report-next-side';
import {ReportNextSection} from './report-next-section';
import type {ReportNextActionSink} from './report-next.types';

/**
 * «Что изменить»: варианты с уже пересчитанным результатом. Рекомендованный
 * (`tone: 'pass'`) выделен акцентной рамкой — это единственная строка отчёта,
 * которой тон рамки положен: она предлагает действие, а не сообщает статус.
 */
export function LiftReportNextSuggestions({
  suggestions,
  onAction,
}: {
  suggestions: LiftReportSuggestions | undefined;
  onAction: ReportNextActionSink;
}) {
  if (suggestions === undefined) {
    return null;
  }

  return (
    <ReportNextSection label={suggestions.title ?? 'Что изменить'}>
      {suggestions.items.map(item => (
        <ReportRow
          key={item.id}
          title={item.title}
          detail={item.detail}
          tone={item.tone === 'pass' ? 'accent' : 'neutral'}
          side={<LiftReportNextSide item={item} onAction={onAction} />}
        />
      ))}
    </ReportNextSection>
  );
}
