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

  // Палитра `LiftEditor` (`le`): те же значения макетов SP-AI, но своя группа —
  // компоненты независимы, и правка палитры одного не должна молча красить
  // другой (Решение 5 design lift-editor-sections-responsive).
  'color-le-surface': '#fafaf9',
  'color-le-surface-sunken': '#f1f1ef',
  'color-le-border': '#e5e4e1',
  'color-le-text': '#1f1f1e',
  'color-le-text-muted': '#6e6e6a',
  'color-le-accent': '#245a87',

  // Палитра `ThermalReport` (`tr`): та же тёплая нейтраль макетов SP-AI,
  // своя группа по канону ce/le (правка палитры одного компонента не красит
  // другие). Статусные цвета — общие danger/success/warning.
  'color-tr-surface': '#fafaf9',
  'color-tr-surface-sunken': '#f1f1ef',
  'color-tr-border': '#e5e4e1',
  'color-tr-text': '#1f1f1e',
  'color-tr-text-muted': '#6e6e6a',
  'color-tr-accent': '#245a87',

  // Палитра `KeoEditor` (`ke`): та же тёплая нейтраль макетов SP-AI, своя
  // группа по канону ce/le/tr.
  'color-ke-surface': '#fafaf9',
  'color-ke-surface-sunken': '#f1f1ef',
  'color-ke-border': '#e5e4e1',
  'color-ke-text': '#1f1f1e',
  'color-ke-text-muted': '#6e6e6a',
  'color-ke-accent': '#245a87',

  // Палитра `KeoReport` (`kr`).
  'color-kr-surface': '#fafaf9',
  'color-kr-surface-sunken': '#f1f1ef',
  'color-kr-border': '#e5e4e1',
  'color-kr-text': '#1f1f1e',
  'color-kr-text-muted': '#6e6e6a',
  'color-kr-accent': '#245a87',

  // Палитра `InsolationEditor` (`ie`).
  'color-ie-surface': '#fafaf9',
  'color-ie-surface-sunken': '#f1f1ef',
  'color-ie-border': '#e5e4e1',
  'color-ie-text': '#1f1f1e',
  'color-ie-text-muted': '#6e6e6a',
  'color-ie-accent': '#245a87',

  // Палитра `InsolationReport` (`ir`) + цвета сегментов таймлайна: солнце
  // наследует success, тень — приглушённую подложку, чтобы тёмная тема хоста
  // раскрашивала полосу вместе с остальной карточкой.
  'color-ir-surface': '#fafaf9',
  'color-ir-surface-sunken': '#f1f1ef',
  'color-ir-border': '#e5e4e1',
  'color-ir-text': '#1f1f1e',
  'color-ir-text-muted': '#6e6e6a',
  'color-ir-accent': '#245a87',
  'color-ir-sun': '#16a34a',
  'color-ir-shadow': '#6e6e6a',
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
  'color-le-surface': 'color-surface',
  'color-le-surface-sunken': 'color-surface-muted',
  'color-le-border': 'color-border',
  'color-le-text': 'color-text-strong',
  'color-le-text-muted': 'color-text-subtle',
  'color-le-accent': 'color-accent',
  'color-tr-surface': 'color-surface',
  'color-tr-surface-sunken': 'color-surface-muted',
  'color-tr-border': 'color-border',
  'color-tr-text': 'color-text-strong',
  'color-tr-text-muted': 'color-text-subtle',
  'color-tr-accent': 'color-accent',
  'color-ke-surface': 'color-surface',
  'color-ke-surface-sunken': 'color-surface-muted',
  'color-ke-border': 'color-border',
  'color-ke-text': 'color-text-strong',
  'color-ke-text-muted': 'color-text-subtle',
  'color-ke-accent': 'color-accent',
  'color-kr-surface': 'color-surface',
  'color-kr-surface-sunken': 'color-surface-muted',
  'color-kr-border': 'color-border',
  'color-kr-text': 'color-text-strong',
  'color-kr-text-muted': 'color-text-subtle',
  'color-kr-accent': 'color-accent',
  'color-ie-surface': 'color-surface',
  'color-ie-surface-sunken': 'color-surface-muted',
  'color-ie-border': 'color-border',
  'color-ie-text': 'color-text-strong',
  'color-ie-text-muted': 'color-text-subtle',
  'color-ie-accent': 'color-accent',
  'color-ir-surface': 'color-surface',
  'color-ir-surface-sunken': 'color-surface-muted',
  'color-ir-border': 'color-border',
  'color-ir-text': 'color-text-strong',
  'color-ir-text-muted': 'color-text-subtle',
  'color-ir-accent': 'color-accent',
  'color-ir-sun': 'color-success',
  'color-ir-shadow': 'color-text-subtle',
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

  leSurface: cssVar('color-le-surface'),
  leSurfaceSunken: cssVar('color-le-surface-sunken'),
  leBorder: cssVar('color-le-border'),
  leText: cssVar('color-le-text'),
  leTextMuted: cssVar('color-le-text-muted'),
  leAccent: cssVar('color-le-accent'),

  trSurface: cssVar('color-tr-surface'),
  trSurfaceSunken: cssVar('color-tr-surface-sunken'),
  trBorder: cssVar('color-tr-border'),
  trText: cssVar('color-tr-text'),
  trTextMuted: cssVar('color-tr-text-muted'),
  trAccent: cssVar('color-tr-accent'),

  keSurface: cssVar('color-ke-surface'),
  keSurfaceSunken: cssVar('color-ke-surface-sunken'),
  keBorder: cssVar('color-ke-border'),
  keText: cssVar('color-ke-text'),
  keTextMuted: cssVar('color-ke-text-muted'),
  keAccent: cssVar('color-ke-accent'),

  krSurface: cssVar('color-kr-surface'),
  krSurfaceSunken: cssVar('color-kr-surface-sunken'),
  krBorder: cssVar('color-kr-border'),
  krText: cssVar('color-kr-text'),
  krTextMuted: cssVar('color-kr-text-muted'),
  krAccent: cssVar('color-kr-accent'),

  ieSurface: cssVar('color-ie-surface'),
  ieSurfaceSunken: cssVar('color-ie-surface-sunken'),
  ieBorder: cssVar('color-ie-border'),
  ieText: cssVar('color-ie-text'),
  ieTextMuted: cssVar('color-ie-text-muted'),
  ieAccent: cssVar('color-ie-accent'),

  irSurface: cssVar('color-ir-surface'),
  irSurfaceSunken: cssVar('color-ir-surface-sunken'),
  irBorder: cssVar('color-ir-border'),
  irText: cssVar('color-ir-text'),
  irTextMuted: cssVar('color-ir-text-muted'),
  irAccent: cssVar('color-ir-accent'),
  irSun: cssVar('color-ir-sun'),
  irShadow: cssVar('color-ir-shadow'),
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
