import React from 'react';
import type {
  VerificationReportDetail,
  VerificationReportSource,
} from '@ai37/a2ui-catalog-schemas';
import {VerificationReportSources} from './verification-report-sources';

/**
 * Панель раскрытой проверки: ключевые значения парами «подпись — значение»
 * и строка источников. Значения — готовые строки агента.
 */
export function VerificationReportCheckPanel({
  details,
  sources,
}: {
  details: VerificationReportDetail[] | undefined;
  sources: VerificationReportSource[] | undefined;
}) {
  return (
    <div style={panelStyle}>
      <VerificationReportDetails details={details} />
      <VerificationReportSources sources={sources} />
    </div>
  );
}

function VerificationReportDetails({details}: {details: VerificationReportDetail[] | undefined}) {
  if (details === undefined) {
    return null;
  }

  return (
    <dl className="a2ui-t--sub" style={listStyle}>
      {details.map((detail, index) => (
        <React.Fragment key={`${detail.label}-${index}`}>
          <dt className="a2ui-t--muted">{detail.label}</dt>
          <dd style={valueStyle}>{detail.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

const panelStyle: React.CSSProperties = {display: 'grid', gap: 10};

/* Подпись — узкая колонка, значение забирает остаток и переносится по словам:
   расшифровка ОКВЭД бывает в две строки. */
const listStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(96px, 30%) minmax(0, 1fr)',
  columnGap: 16,
  rowGap: 6,
  margin: 0,
};

const valueStyle: React.CSSProperties = {margin: 0, overflowWrap: 'break-word'};
