/**
 * Единственный источник значений набора примитивов. Примитивы читают только
 * эти имена: литералов цвета и кегля в их правилах нет, поэтому поверхность
 * перекрашивает любой слой, объявив токен у себя на корне.
 *
 * Слои идут сверху вниз: шкала и цвет текста — общий язык; `--a2ui-btn-*` и
 * `--a2ui-card-*` ссылаются на него, а не на литералы, чтобы смена цвета текста
 * доходила до кнопки и карточки сама.
 */
export const KIT_TOKENS: Array<[string, string]> = [
  ['--a2ui-font', 'system-ui, -apple-system, "Segoe UI", sans-serif'],
  // Ось семейства, а не вторая шкала: её носит заголовок вердикта отчёта.
  ['--a2ui-font-serif', 'Georgia, "Times New Roman", serif'],

  // --- шкала: три ступени и один модификатор начертания -------------------
  ['--a2ui-text-size-display', '26px'],
  ['--a2ui-text-line-display', '1.2'],
  ['--a2ui-text-size-body', '14px'],
  ['--a2ui-text-line-body', '1.35'],
  ['--a2ui-text-size-sub', '12px'],
  ['--a2ui-text-line-sub', '1.3'],
  ['--a2ui-text-weight-strong', '500'],
  ['--a2ui-text-overline-tracking', '0.21px'],

  // --- цвет текста --------------------------------------------------------
  ['--a2ui-text-color', '#1f1f1e'],
  ['--a2ui-text-color-muted', '#6e6e6a'],
  ['--a2ui-text-color-accent', '#245a87'],
  ['--a2ui-text-color-danger', '#dc2626'],
  ['--a2ui-text-color-success', '#16a34a'],
  ['--a2ui-text-color-warning', '#b45309'],
  ['--a2ui-text-color-on-fill', '#fafaf9'],

  // --- поверхности --------------------------------------------------------
  ['--a2ui-card-surface', '#fafaf9'],
  ['--a2ui-card-surface-sunken', '#f1f1ef'],
  ['--a2ui-card-surface-plain', '#ffffff'],
  ['--a2ui-card-border', '#e5e4e1'],
  ['--a2ui-card-danger', 'var(--a2ui-text-color-danger)'],
  ['--a2ui-card-radius', '14px'],
  ['--a2ui-card-radius-sunken', '10px'],

  // --- кнопка -------------------------------------------------------------
  ['--a2ui-btn-fg', 'var(--a2ui-text-color)'],
  ['--a2ui-btn-surface', 'var(--a2ui-card-surface)'],
  ['--a2ui-btn-border', 'var(--a2ui-card-border)'],
  ['--a2ui-btn-text-muted', 'var(--a2ui-text-color-muted)'],
  ['--a2ui-btn-accent', 'var(--a2ui-text-color-accent)'],
  ['--a2ui-btn-danger', 'var(--a2ui-text-color-danger)'],
  ['--a2ui-btn-radius', '9px'],

  // --- пилюля -------------------------------------------------------------
  ['--a2ui-chip-border', 'var(--a2ui-card-border)'],
  ['--a2ui-chip-fg', 'var(--a2ui-text-color-muted)'],

  // --- контрол формы ------------------------------------------------------
  ['--a2ui-control-surface', 'var(--a2ui-card-surface-plain)'],
  ['--a2ui-control-border', 'var(--a2ui-card-border)'],
  ['--a2ui-control-radius', '8px'],
  ['--a2ui-control-highlight', 'var(--a2ui-card-surface-sunken)'],
];

/**
 * Что попапу нужно объявить у себя: он уезжает в портал и наружного слоя не
 * видит (`pop.closest('#root') === null`). Набор именно подмножество — имена
 * фильтруются из общего слоя, поэтому разойтись значениями им нечем.
 */
export const POPUP_TOKEN_NAMES: string[] = [
  '--a2ui-font',
  '--a2ui-text-size-body',
  '--a2ui-text-line-body',
  '--a2ui-text-size-sub',
  '--a2ui-text-line-sub',
  '--a2ui-text-weight-strong',
  '--a2ui-text-color',
  '--a2ui-text-color-muted',
  '--a2ui-text-color-accent',
  '--a2ui-text-color-danger',
  '--a2ui-card-border',
  '--a2ui-card-surface-plain',
  '--a2ui-card-surface-sunken',
  '--a2ui-control-highlight',
];
