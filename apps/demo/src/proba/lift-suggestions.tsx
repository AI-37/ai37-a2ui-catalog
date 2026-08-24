import React from 'react';
import type {LiftReportSuggestions} from '@ai37/a2ui-catalog-schemas';
import {LiftSuggestionSide} from './lift-suggestion-side';
import {ReportRow} from './report-row';
import {ReportSection} from './report-section';

/**
 * «Что изменить»: варианты с уже пересчитанным результатом. Рекомендованный
 * (`tone: 'pass'`) выделен акцентной рамкой — это единственная строка отчёта,
 * которой тон рамки положен: она предлагает действие, а не сообщает статус.
 */
export function LiftSuggestions({suggestions}: {suggestions: LiftReportSuggestions | undefined}) {
  if (suggestions === undefined) {
    return null;
  }

  return (
    <ReportSection label={suggestions.title ?? 'Что изменить'}>
      {suggestions.items.map(item => (
        <ReportRow
          key={item.id}
          title={item.title}
          detail={item.detail}
          tone={item.tone === 'pass' ? 'accent' : 'neutral'}
          side={<LiftSuggestionSide item={item} />}
        />
      ))}
    </ReportSection>
  );
}
