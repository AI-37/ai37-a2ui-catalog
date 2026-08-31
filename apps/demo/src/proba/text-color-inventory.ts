/** Цвет текста в предложении: токен, значение, роль, что он вбирает. */
export interface TextColorStep {
  token: string;
  value: string;
  role: string;
  /** Класс-модификатор образца. */
  className: string;
  /** Отрисовывать образец на заливке, а не на фоне карточки. */
  onFill?: boolean;
  absorbs: string;
}

/**
 * Цвета текста: семь ролей вместо восьми копий одной палитры.
 *
 * Сегодня в `tokens.ts` восемь групп (`ce/le/tr/kr/lr/ir/ke/ie`), и все восемь
 * держат одни и те же три значения — 24 объявления на три цвета. Плюс общая
 * slate-палитра (`color-text` #1e293b и соседи), которой пользуются FormCard и
 * ChoiceCard: то есть основного цвета текста в каталоге сегодня два.
 */
export const TEXT_COLORS: TextColorStep[] = [
  {
    token: '--a2ui-text-color',
    value: 'light-dark(#1f1f1e, #ededea)',
    role: 'основной текст, титулы, значения полей',
    className: '',
    absorbs: 'ce/le/tr/kr/lr/ir/ke/ie-text — 8 копий одного значения',
  },
  {
    token: '--a2ui-text-color-muted',
    value: 'light-dark(#6e6e6a, #a0a09b)',
    role: 'вторичный текст, подписи, сводки, счётчики',
    className: 'a2ui-t--muted',
    absorbs: '*-text-muted — те же 8 копий',
  },
  {
    token: '--a2ui-text-color-accent',
    value: 'light-dark(#245a87, #7cb0de)',
    role: 'ссылка, «Показать», «Скачать», акцентная кнопка',
    className: 'a2ui-t--accent',
    absorbs: '*-accent — те же 8 копий',
  },
  {
    token: '--a2ui-text-color-danger',
    value: 'light-dark(#dc2626, #ff6b74)',
    role: 'удаление, не проходит по норме',
    className: 'a2ui-t--danger',
    absorbs: 'color-danger — уже общий, копий нет',
  },
  {
    token: '--a2ui-text-color-success',
    value: 'light-dark(#16a34a, #3e9b6c)',
    role: 'соответствует, «готова»',
    className: 'a2ui-t--success',
    absorbs: 'color-success — уже общий',
  },
  {
    token: '--a2ui-text-color-warning',
    value: 'light-dark(#b45309, #d9a514)',
    role: 'подтвердите, «просмотреть»',
    className: 'a2ui-t--warning',
    absorbs: 'color-warning — уже общий',
  },
  {
    token: '--a2ui-text-color-on-fill',
    value: 'light-dark(#fafaf9, #191918)',
    role: 'текст на залитой кнопке и на тёмном фоне',
    className: 'a2ui-t--on-fill',
    onFill: true,
    absorbs: '*-surface, использованный как цвет текста в filled-кнопках',
  },
];

/**
 * Расхождение, которое цветовая ревизия обязана назвать: основного цвета
 * текста в каталоге сегодня два, и они из разных палитр.
 */
export const COLOR_CONFLICT: Array<[string, string]> = [
  ['#1f1f1e', 'тёплый нейтральный — CE и все семь остальных поверхностей'],
  ['#1e293b', 'slate — FormCard, ChoiceCard и общий color-text из tokens.ts'],
];
