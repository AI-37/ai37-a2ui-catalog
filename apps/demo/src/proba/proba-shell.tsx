import React from 'react';
import {ProbaThemeToggle} from './proba-theme-toggle';
import type {ProbaTheme} from './proba-theme-toggle.types';
import type {ProbaShellProps} from './proba-shell.types';

/** Роуты ревизии: ключ — путь, значение — подпись в переключателе. */
export const PROBA_ROUTES: Array<[string, string]> = [
  ['/proba/system', 'Готовое'],
  ['/proba/assembly', 'Сборка'],
  ['/proba/lift-assembly', 'Лифты'],
  ['/proba/keo-assembly', 'КЕО'],
  ['/proba/report-assembly', 'Отчёты'],
  ['/proba/lookup', 'Поиск'],
  ['/proba/revision', 'Ревизия'],
];

/**
 * Общая рама страниц ревизии: переключатель разделов, заголовок, лид.
 *
 * С `themeToggle` рама отдаёт странице тему тем же способом, каким её отдаёт
 * потребитель каталога, — атрибутом `data-a2ui-theme` на предке. Своё
 * оформление рамы объявлено парами `light-dark()`: страница без тумблера
 * атрибута не несёт, `color-scheme` остаётся `normal`, и рама читается светлой,
 * как раньше.
 */
export function ProbaShell({route, eyebrow, title, lead, themeToggle, children}: ProbaShellProps) {
  const [theme, setTheme] = React.useState<ProbaTheme>('light');

  return (
    <main style={pageStyle} data-a2ui-theme={themeToggle ? theme : undefined}>
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
        {themeToggle ? <ProbaThemeToggle theme={theme} onChange={setTheme} /> : null}
      </header>

      {children}
    </main>
  );
}

/* Фон объявлен на самой раме, а не оставлен телу страницы: тёмная витрина
   иначе висела бы светлым прямоугольником поверх глобального градиента demo. */
const pageStyle: React.CSSProperties = {
  display: 'grid',
  gap: 24,
  alignContent: 'start',
  minHeight: '100vh',
  maxWidth: 1180,
  margin: '0 auto',
  padding: '32px 24px 80px',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  color: 'light-dark(#0f172a, #ededea)',
  background: 'light-dark(transparent, #101010)',
};

/* Переносится: разделов шесть, и в узком окне ряд вкладок распирал страницу
   до горизонтального скролла — по нему потом «ехала» и вёрстка отчётов. */
const navStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};

const tabStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 999,
  border: '1px solid light-dark(rgba(15, 23, 42, 0.12), rgba(237, 237, 234, 0.16))',
  background: 'light-dark(#ffffff, #1c1c1b)',
  color: 'light-dark(#475569, #a0a09b)',
  fontSize: 13,
  textDecoration: 'none',
};

const tabActiveStyle: React.CSSProperties = {
  ...tabStyle,
  borderColor: 'transparent',
  background: 'light-dark(#0f172a, #ededea)',
  color: 'light-dark(#ffffff, #191918)',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11.5,
  letterSpacing: 1.2,
  fontWeight: 600,
  color: 'light-dark(#b45309, #d9a514)',
};

const leadStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.55,
  color: 'light-dark(#475569, #a0a09b)',
};
