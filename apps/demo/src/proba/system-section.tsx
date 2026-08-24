import React from 'react';

/** Рама блока витрины: одинаковая у всех разделов `/proba/system`. */
export const SYSTEM_SECTION_STYLE: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.1)',
  background: '#ffffff',
};

/** Заголовок блока витрины: имя примитива и его оси. */
export function SystemHeading({title, axes}: {title: string; axes: string}) {
  return (
    <h2 style={h2Style}>
      {title} <code style={codeStyle}>{axes}</code>
    </h2>
  );
}

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};
const codeStyle: React.CSSProperties = {fontSize: 13, color: '#64748b', fontWeight: 400};
