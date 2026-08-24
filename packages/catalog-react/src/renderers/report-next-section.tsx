import React from 'react';

/**
 * Списочная секция отчёта: подпись-оверлайн и строки под ней. Подпись стоит
 * снаружи строк, поэтому одинакова у «Проверок», «Конструкций» и «Что
 * изменить» — три блока двух отчётов различаются только словом.
 */
export function ReportNextSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">{label}</span>
      <div style={rowsStyle}>{children}</div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {display: 'grid', gap: 10};
const rowsStyle: React.CSSProperties = {display: 'grid', gap: 8};
