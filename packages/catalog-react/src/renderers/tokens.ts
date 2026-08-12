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
  'color-warning': '#b45309',
  'color-success': '#16a34a',

  'color-formula-from': '#f8fafc',
  'color-formula-to': '#eef2ff',

  // Палитра макета теплотехнического брифа (`ConstructionsEditor`): тёплый
  // нейтральный, с общей slate-палитрой каталога почти не пересекается.
  // Отдельной группой, а не заменой общих токенов: подмена перекрасила бы и
  // остальные рендереры, которых этот макет не касается.
  'color-ce-surface': '#fafaf9',
  'color-ce-surface-sunken': '#f1f1ef',
  'color-ce-border': '#e5e4e1',
  'color-ce-text': '#1f1f1e',
  'color-ce-text-muted': '#6e6e6a',
  'color-ce-accent': '#245a87',
} as const;

type TokenName = keyof typeof DEFAULTS;

/**
 * Токены палитры макета наследуют общие токены каталога: хост, объявивший тему
 * (в т.ч. тёмную) для `--a2ui-color-surface` и соседей, получает
 * `ConstructionsEditor` в этой теме, ничего не зная про группу `ce`. Значение
 * макета остаётся последним фолбэком — «из коробки» компонент выглядит так,
 * как нарисован.
 */
const INHERITS: Partial<Record<TokenName, TokenName>> = {
  'color-ce-surface': 'color-surface',
  'color-ce-surface-sunken': 'color-surface-muted',
  'color-ce-border': 'color-border',
  'color-ce-text': 'color-text-strong',
  'color-ce-text-muted': 'color-text-subtle',
  'color-ce-accent': 'color-accent',
};

function cssVar(name: TokenName): string {
  const inherited = INHERITS[name];

  return inherited === undefined
    ? `var(--a2ui-${name}, ${DEFAULTS[name]})`
    : `var(--a2ui-${name}, var(--a2ui-${inherited}, ${DEFAULTS[name]}))`;
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
  warning: cssVar('color-warning'),
  success: cssVar('color-success'),

  formulaFrom: cssVar('color-formula-from'),
  formulaTo: cssVar('color-formula-to'),

  ceSurface: cssVar('color-ce-surface'),
  ceSurfaceSunken: cssVar('color-ce-surface-sunken'),
  ceBorder: cssVar('color-ce-border'),
  ceText: cssVar('color-ce-text'),
  ceTextMuted: cssVar('color-ce-text-muted'),
  ceAccent: cssVar('color-ce-accent'),
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
