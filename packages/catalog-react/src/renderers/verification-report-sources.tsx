import React from 'react';
import type {VerificationReportSource} from '@ai37/a2ui-catalog-schemas';

/**
 * Строка «Источник: ЕГРЮЛ · ГИР БО». Ссылкой становится только http(s):
 * формат URL схема не проверяет, а `javascript:` в href — уже не ссылка.
 */
export function VerificationReportSources({
  sources,
}: {
  sources: VerificationReportSource[] | undefined;
}) {
  if (sources === undefined) {
    return null;
  }

  return (
    <p className="a2ui-t--sub a2ui-t--muted" style={lineStyle}>
      <span>{sources.length > 1 ? 'Источники:' : 'Источник:'}</span>
      {sources.map((source, index) => (
        <VerificationReportSourceItem key={`${source.label}-${index}`} source={source} />
      ))}
    </p>
  );
}

function VerificationReportSourceItem({source}: {source: VerificationReportSource}) {
  if (!isWebUrl(source.url)) {
    return <span>{source.label}</span>;
  }

  return (
    <a className="a2ui-t--accent" href={source.url} target="_blank" rel="noopener noreferrer">
      {source.label}
    </a>
  );
}

function isWebUrl(url: string | undefined): url is string {
  return url !== undefined && /^https?:\/\//i.test(url);
}

const lineStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px 10px',
  margin: 0,
};
