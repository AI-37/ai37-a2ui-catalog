import React from 'react';
import type {ProbaShellProps} from './proba-shell.types';

/** Роуты ревизии: ключ — путь, значение — подпись в переключателе. */
export const PROBA_ROUTES: Array<[string, string]> = [
  ['/proba/system', 'Готовое'],
  ['/proba/assembly', 'Сборка'],
  ['/proba/revision', 'Ревизия'],
];

/** Общая рама страниц ревизии: переключатель разделов, заголовок, лид. */
export function ProbaShell({route, eyebrow, title, lead, children}: ProbaShellProps) {
  return (
    <main style={pageStyle}>
      <nav style={navStyle}>
        {PROBA_ROUTES.map(([href, label]) => (
          <a key={href} href={href} style={href === route ? tabActiveStyle : tabStyle}>
            {label}
          </a>
        ))}
      </nav>

      <header style={{display: 'grid', gap: 10, maxWidth: 760}}>
        <p style={eyebrowStyle}>{eyebrow}</p>
        <h1 style={{margin: 0, fontSize: 32, lineHeight: 1.1}}>{title}</h1>
        <p style={leadStyle}>{lead}</p>
      </header>

      {children}
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  display: 'grid',
  gap: 24,
  maxWidth: 1180,
  margin: '0 auto',
  padding: '32px 24px 80px',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  color: '#0f172a',
};

const navStyle: React.CSSProperties = {display: 'flex', gap: 8};

const tabStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#ffffff',
  color: '#475569',
  fontSize: 13,
  textDecoration: 'none',
};

const tabActiveStyle: React.CSSProperties = {
  ...tabStyle,
  borderColor: 'transparent',
  background: '#0f172a',
  color: '#ffffff',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11.5,
  letterSpacing: 1.2,
  fontWeight: 600,
  color: '#b45309',
};

const leadStyle: React.CSSProperties = {margin: 0, fontSize: 15, lineHeight: 1.55, color: '#475569'};
