/**
 * Единственный источник значений набора примитивов. Примитивы читают только
 * эти имена: литералов цвета и кегля в их правилах нет.
 *
 * Цветной токен несёт **обе половины темы одним значением** —
 * `light-dark(<светлое>, <тёмное>)`. Какая половина читается, решает
 * `color-scheme`: свойство наследуемое, поэтому хост объявляет его один раз у
 * себя на контейнере, и до набора оно доходит **сквозь** это объявление —
 * наследуется не значение токена, а то, как оно читается. Прежняя обещанная
 * перекраска «объяви токен у себя на корне» так не работала: собственное
 * объявление на `.a2ui-kit` сильнее унаследованного.
 *
 * Значит: хочешь тему — ставь `data-a2ui-theme="dark"` (или прямой
 * `color-scheme`) на любом предке корня набора, см. `kit-tokens-css.ts`.
 * Хочешь другую палитру — переопредели токен у себя **на том же
 * `.a2ui-kit`** или ниже, а не на предке.
 *
 * Слои идут сверху вниз: шкала и цвет текста — общий язык; `--a2ui-btn-*` и
 * `--a2ui-card-*` ссылаются на него, а не на литералы, чтобы смена цвета текста
 * доходила до кнопки и карточки сама. Токен-ссылка своей пары не заводит —
 * тему он получает транзитом.
 *
 * Источник значений: коллекция Figma «SP-AI / Semantic», моды Light и Dark
 * (то же зеркало, что в `spai-ui/app/globals.css`). Где значение выведено, а не
 * взято из макета, — сказано в комментарии рядом.
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
  ['--a2ui-text-color', 'light-dark(#1f1f1e, #ededea)'],
  ['--a2ui-text-color-muted', 'light-dark(#6e6e6a, #a0a09b)'],
  ['--a2ui-text-color-accent', 'light-dark(#245a87, #7cb0de)'],
  // Тёмная половина выведена: макетный #ff4757 даёт 4,28:1 на самой светлой
  // тёмной подложке (`--a2ui-card-surface-plain`, на ней стоит пункт меню
  // «Удалить») — ниже AA. Осветлён по тону до 5,17:1.
  ['--a2ui-text-color-danger', 'light-dark(#dc2626, #ff6b74)'],
  ['--a2ui-text-color-success', 'light-dark(#16a34a, #3e9b6c)'],
  ['--a2ui-text-color-warning', 'light-dark(#b45309, #d9a514)'],
  // Текст на заливке цвета `--a2ui-text-color`: в тёмной теме заливка светлая,
  // значит текст на ней — тёмный.
  ['--a2ui-text-color-on-fill', 'light-dark(#fafaf9, #191918)'],

  // --- поверхности --------------------------------------------------------
  ['--a2ui-card-surface', 'light-dark(#fafaf9, #191918)'],
  ['--a2ui-card-surface-sunken', 'light-dark(#f1f1ef, #242423)'],
  ['--a2ui-card-surface-plain', 'light-dark(#ffffff, #2a2a2f)'],
  ['--a2ui-card-border', 'light-dark(#e5e4e1, #33322f)'],
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
  // Заливка значения, пришедшего готовым («из проекта», «рассчитано»). Своё
  // значение, а не `--a2ui-card-surface-sunken`: коробка стоит и на светлом
  // теле карточки, и внутри утопленной секции — на равном с фоном сером она
  // там исчезала бы вовсе. Ступень темнее утопленного фона видна на обоих.
  ['--a2ui-control-surface-ready', 'light-dark(#e6e5e2, #2f2f2d)'],

  // --- тень ---------------------------------------------------------------
  // Токен несёт только цвет тени: геометрия остаётся в правиле, потому что
  // `light-dark()` — функция цвета и целый `box-shadow` в неё не кладётся.
  // Тёмная половина выведена: полупрозрачная синька на тёмной подложке не
  // читается, отрыв попапа от фона держит плотный чёрный.
  ['--a2ui-shadow-popup', 'light-dark(rgba(15, 23, 42, 0.12), rgba(0, 0, 0, 0.5))'],
];

/**
 * Что попапу нужно объявить у себя: он уезжает в портал и наружного слоя не
 * видит (`pop.closest('#root') === null`). Набор именно подмножество — имена
 * фильтруются из общего слоя, поэтому разойтись значениями им нечем, и второй
 * половины темы у попапа тоже нет: пары приезжают вместе со значениями.
 *
 * Чего подмножество не даёт — `color-scheme`: свойство наследуемое, а предка
 * с темой у портального узла нет. Схему доносит `usePopupScheme` от якоря.
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
  '--a2ui-shadow-popup',
];
