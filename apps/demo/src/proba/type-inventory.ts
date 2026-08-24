import type {ProposedTypeStep, TypeStep} from './type-inventory.types';

const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';
// Georgia остаётся только в ревизии «как есть»: в предложении гарнитура одна.
const SERIF = "Georgia, 'Times New Roman', serif";

/**
 * Фактическая шкала каталога: девять кеглей, посчитанных по всем
 * `renderers/*-styles.ts`. Порядок — сверху вниз по размеру, чтобы соседние
 * ступени стояли рядом и было видно, где разница ниже порога заметности.
 */
export const TYPE_INVENTORY: TypeStep[] = [
  {
    size: '26px',
    metrics: 'Georgia serif · 500 · lh 1.2',
    declarations: 4,
    roles: 'вердикт отчёта (tr/kr/lr/ir __headline)',
    sample: {fontFamily: SERIF, fontSize: 26, fontWeight: 500, lineHeight: 1.2},
    text: 'Ro приведённое — 3,21 м²·°C/Вт',
    note: 'единственный serif в каталоге; объявлен четырежды одинаково',
  },
  {
    size: '14px',
    metrics: '400 / 500 · lh 14px или 17px',
    declarations: 20,
    roles: 'корневой кегль поверхности, титул карточки, значение поля, контрол',
    sample: {fontFamily: SANS, fontSize: 14, lineHeight: '17px'},
    text: 'Наружная стена (кирпич + минвата)',
    note: '.a2ui-ce — единственная поверхность без корневого font-size: наследует хостовый',
  },
  {
    size: '13px',
    metrics: '400 · lh 13px (кнопка) или 1.45 (абзац)',
    declarations: 34,
    roles: 'кнопка, абзац-сводка, таблица слоёв, пункт дропдауна',
    sample: {fontFamily: SANS, fontSize: 13, lineHeight: 1.45},
    text: 'Требуемое для наружных стен жилых зданий при ГСОП 6 380 °C·сут — 3,08.',
  },
  {
    size: '12.5px',
    metrics: '400 / 500 · lh 15px',
    declarations: 36,
    roles: 'подпись поля, вторичный текст, ссылка, строка слоя, статус, чип',
    sample: {fontFamily: SANS, fontSize: 12.5, lineHeight: '15px'},
    text: 'Температура внутреннего воздуха tв',
    note: 'самая нагруженная ступень каталога',
  },
  {
    size: '12px',
    metrics: '400 / 500',
    declarations: 11,
    roles: 'счётчик конструкций, th таблицы, ce-btn--edit',
    sample: {fontFamily: SANS, fontSize: 12, lineHeight: '15px'},
    text: 'КОНСТРУКЦИИ · 3',
    note: 'от 12.5px отличается на полпикселя — на глаз это одна ступень',
  },
  {
    size: '11.5px',
    metrics: '400 / 500 · lh 14–15px',
    declarations: 7,
    roles: 'заметка, чип, индекс слоя, «готова» / «просмотреть»',
    sample: {fontFamily: SANS, fontSize: 11.5, lineHeight: '15px'},
    text: 'принято системой · по умолчанию',
  },
  {
    size: '11px',
    metrics: '400',
    declarations: 2,
    roles: 'засечка шкалы инсоляции, шеврон методики лифта',
    sample: {fontFamily: SANS, fontSize: 11, lineHeight: '14px'},
    text: '07:00 · 09:00 · 11:00',
    note: 'две служебные подписи; отдельная ступень ради них не нужна',
  },
  {
    size: '10.5px',
    metrics: '500 · ls 0.21px · uppercase · lh 13px',
    declarations: 16,
    roles: 'подпись секции: УСЛОВИЯ, КОНСТРУКЦИИ, ПРОВЕРКИ',
    sample: {
      fontFamily: SANS,
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: '0.21px',
      textTransform: 'uppercase',
      lineHeight: '13px',
    },
    text: 'Условия расчёта',
  },
  {
    size: '1rem',
    metrics: '400',
    declarations: 1,
    roles: 'крестик удаления карточки (ce-card__remove)',
    sample: {fontFamily: SANS, fontSize: '1rem'},
    text: '✕',
    note: 'единственный rem среди px — размер зависит от хоста, а не от шкалы',
  },
];

/**
 * Предлагаемая шкала: семь именованных ступеней вместо девяти кеглей.

/**
 * Предлагаемая шкала: три кегля 26 / 14 / 11 и одна гарнитура.
 *
 * Разбор восьми ступеней прошлой редакции показал, что половина различий там
 * не размер, а начертание: 14px w500 и 14px w400 — это один кегль, 12.5px w500
 * и 12.5px w400 — тоже. Weight и режим набора остаются модификаторами роли,
 * ступеней шкалы — три.
 *
 * Serif из шкалы убран: он держался на одной роли (вердикт отчёта) и был
 * единственной второй гарнитурой каталога.
 */
export const TYPE_PROPOSAL: ProposedTypeStep[] = [
  {
    token: '--a2ui-text-display',
    metrics: '26/1.2 · 500',
    role: 'вердикт отчёта',
    sample: {fontFamily: SANS, fontSize: 26, fontWeight: 500, lineHeight: 1.2},
    text: 'Ro приведённое — 3,21 м²·°C/Вт',
    absorbs: '26px ×4 · serif → та же гарнитура, что у всего остального',
  },
  {
    token: '--a2ui-text-body',
    metrics: '14/1.35 · 400, титул — 500',
    role: 'текст и титулы: значение поля, контрол, абзац, таблица, кнопка, заголовок карточки',
    sample: {fontFamily: SANS, fontSize: 14, lineHeight: 1.35},
    text: 'Наружная стена (кирпич + минвата)',
    absorbs: '14px ×20 + 13px ×34 — две трети всех объявлений',
  },
  {
    token: '--a2ui-text-sub',
    metrics: '11/1.3 · 400, подпись — 500',
    role: 'подтекст: подпись поля, вторичный текст, ссылка, чип, заметка, подпись секции',
    sample: {fontFamily: SANS, fontSize: 11, lineHeight: 1.3},
    text: 'Курган · климат по СП 131 · условия А',
    absorbs: '12.5px ×36 + 12px ×11 + 11.5px ×7 + 11px + 10.5px ×16 + 1rem',
  },
];

/**
 * Модификаторы: то, что раньше было отдельными ступенями, а на деле меняет не
 * кегль. Живут поверх любой из трёх ступеней, поэтому шкала от них не растёт.
 */
export const TYPE_MODIFIERS: ProposedTypeStep[] = [
  {
    token: 'weight 500',
    metrics: 'тот же кегль, начертание 500',
    role: 'титул карточки (на body), подпись поля (на sub)',
    sample: {fontFamily: SANS, fontSize: 14, fontWeight: 500, lineHeight: 1.35},
    text: 'Параметры расчёта',
    absorbs: 'бывшие ступени title и label',
  },
  {
    token: 'uppercase + ls 0.21',
    metrics: 'sub · 500 · uppercase',
    role: 'подпись секции',
    sample: {
      fontFamily: SANS,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.21px',
      textTransform: 'uppercase',
      lineHeight: 1.3,
    },
    text: 'Условия расчёта',
    absorbs: 'бывшая ступень overline (10.5px ×16)',
  },
];

/**
 * Чем платим за 26/14/11. Ни один пункт не является возражением — это то, что
 * увидит глаз после унификации, и это должно быть решено до кода, а не после.
 */
export const SCALE_COSTS: Array<[string, string]> = [
  [
    'вердикт теряет serif',
    'Georgia держалась на одной роли и давала отчёту «документный» вид; после — одна гарнитура на весь каталог',
  ],
  [
    'подтекст мельчает на 1.5px',
    '36 объявлений 12.5px едут на 11px: подписи полей, ссылки, строки слоёв — самая заметная правка',
  ],
  [
    'кнопка растёт с 13 на 14px',
    'вместе с абзацами и таблицами; промежуточной ступени 13px в шкале 26/14/11 нет',
  ],
  [
    'титул карточки отличается только начертанием',
    'между 26 и 14 ступени нет, поэтому заголовок карточки — это body + weight 500, а не свой кегль',
  ],
];
