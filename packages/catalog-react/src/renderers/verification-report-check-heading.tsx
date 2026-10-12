import React from 'react';
import {ReportRowDetail} from '../primitives';

/**
 * Заголовок строки проверки: название и основание друг под другом. Не в
 * строку, как у `SectionItem`: названия проверок длинные («Реестр
 * недобросовестных поставщиков (РНП)»), и в узком контейнере строка из
 * несжимаемого названия и сводки вылезала за карточку.
 */
export function VerificationReportCheckHeading({
  label,
  summary,
}: {
  label: string;
  summary: string | undefined;
}) {
  return (
    <span style={headingStyle}>
      <span className="a2ui-t--body">{label}</span>
      <ReportRowDetail detail={summary} />
    </span>
  );
}

const headingStyle: React.CSSProperties = {display: 'grid', gap: 2, minWidth: 0};
