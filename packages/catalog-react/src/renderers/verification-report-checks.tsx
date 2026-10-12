import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import type {VerificationReportCheck} from '@ai37/a2ui-catalog-schemas';
import {ReportNextSection} from './report-next-section';
import {VerificationReportCheckRow} from './verification-report-check-row';

/**
 * «Проверки». Один `Accordion` на весь список, раскрыть можно несколько строк
 * сразу: проверяющий сравнивает основания соседних проверок (ОКВЭД рядом с
 * финансами), а схлопывание соседа при раскрытии мешало бы. Нет проверок —
 * секция не занимает места.
 */
export function VerificationReportChecks({checks}: {checks: VerificationReportCheck[]}) {
  // Экранов на странице может быть несколько (полная и точечная проверка в
  // одном треде): id панелей несут приставку экрана.
  const scope = React.useId();

  if (checks.length === 0) {
    return null;
  }

  return (
    <ReportNextSection label="Проверки">
      <Accordion.Root multiple style={listStyle}>
        {checks.map((check, index) => (
          <VerificationReportCheckRow
            key={`${check.id}-${index}`}
            check={check}
            value={`${check.id}-${index}`}
            panelId={`${scope}-${check.id}-${index}`}
          />
        ))}
      </Accordion.Root>
    </ReportNextSection>
  );
}

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};
