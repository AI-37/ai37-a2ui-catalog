/**
 * Цветовые токены каталога.
 *
 * Значения вынесены в CSS custom properties (`--a2ui-*`), чтобы тему можно
 * было переопределить на любом родителе, не трогая JS и не упираясь в
 * специфичность инлайн-стилей. Fallback внутри `var(..., fallback)` — это
 * дефолтная (светлая) тема и единственный источник правды для значений
 * по умолчанию: рендереры работают «из коробки» даже без объявленной темы.
 *
 * Темизация: объявить нужные переменные на родителе, например
 *   .my-dark-theme { --a2ui-color-surface: #0f172a; --a2ui-color-text: #e2e8f0; }
 */

const DEFAULTS = {
  'color-text-strong': '#0f172a',
  'color-text': '#1e293b',
  'color-text-muted': '#475569',
  'color-text-subtle': '#64748b',

  'color-surface': '#ffffff',
  'color-surface-muted': '#f8fafc',
  'color-surface-warm': '#fffdf8',
  'color-surface-header': '#eef2f7',

  'color-border': 'rgba(15, 23, 42, 0.12)',
  'color-border-strong': 'rgba(15, 23, 42, 0.18)',
  'color-border-soft': 'rgba(15, 23, 42, 0.1)',
  'color-border-subtle': 'rgba(15, 23, 42, 0.08)',
  'color-border-faint': 'rgba(15, 23, 42, 0.05)',

  'color-accent': '#1e293b',
  'color-accent-contrast': '#ffffff',
  'color-danger': '#dc2626',

  'color-formula-from': '#f8fafc',
  'color-formula-to': '#eef2ff',
} as const;

type TokenName = keyof typeof DEFAULTS;

function cssVar(name: TokenName): string {
  return `var(--a2ui-${name}, ${DEFAULTS[name]})`;
}

/** Семантические токены для использования в стилях рендереров. */
export const tokens = {
  textStrong: cssVar('color-text-strong'),
  text: cssVar('color-text'),
  textMuted: cssVar('color-text-muted'),
  textSubtle: cssVar('color-text-subtle'),

  surface: cssVar('color-surface'),
  surfaceMuted: cssVar('color-surface-muted'),
  surfaceWarm: cssVar('color-surface-warm'),
  surfaceHeader: cssVar('color-surface-header'),

  border: cssVar('color-border'),
  borderStrong: cssVar('color-border-strong'),
  borderSoft: cssVar('color-border-soft'),
  borderSubtle: cssVar('color-border-subtle'),
  borderFaint: cssVar('color-border-faint'),

  accent: cssVar('color-accent'),
  accentContrast: cssVar('color-accent-contrast'),
  danger: cssVar('color-danger'),

  formulaFrom: cssVar('color-formula-from'),
  formulaTo: cssVar('color-formula-to'),
} as const;

/** id для тега <style> с дефолтной темой (если консьюмер решит её объявить). */
export const A2UI_THEME_STYLE_ID = 'a2ui-catalog-theme';

/**
 * CSS дефолтной темы в виде набора `--a2ui-*` переменных на `:root`.
 *
 * Объявлять необязательно — fallback'и в `tokens` уже задают эти значения.
 * Полезно, если нужен явный, инспектируемый источник темы, который удобно
 * переопределять (консьюмер сам контролирует селектор/порядок подключения).
 */
export const defaultThemeCss = `:root {\n${Object.entries(DEFAULTS)
  .map(([name, value]) => `  --a2ui-${name}: ${value};`)
  .join('\n')}\n}`;
