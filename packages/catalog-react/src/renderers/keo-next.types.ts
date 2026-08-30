import type {
  CalcCondition,
  CalcEditorField,
  CalcFieldSource,
  KeoEditorProps,
  KeoEditorSection,
} from '@ai37/a2ui-catalog-schemas';
import type {AddItemState} from './add-item-state.types';
import type {CalcFieldValues, CalcScreenState} from './calc-editor.types';

/** Значение поля экрана: числовое отдаёт `number | null`, список — строку. */
export type KeoFieldValue = string | number | null;

/** Рабочая копия помещения — общий тип повторяемого экрана расчётного редактора. */
export type KeoRoomDraft = CalcScreenState;

/** Документ, уезжающий наружу: то же, что шлёт нынешний `KeoEditor`. */
export interface KeoDocument {
  conditions: Record<string, string>;
  rooms: Array<{name: string; values: CalcFieldValues}>;
}

/**
 * Куда уезжает состояние экрана. У страницы песочницы a2ui-контекста нет,
 * поэтому получатель приходит извне, а не берётся из `dispatchAction`.
 */
export interface KeoSink {
  onSubmit: (document: KeoDocument) => void;
  /**
   * Автосохранение черновика. Необязательно: без `draftAction` получателя не
   * существует, и черновик не собирается вовсе.
   */
  onDraft?: ((document: KeoDocument) => void) | undefined;
}

/** Пометка секции: незаполненные обязательные поля либо непросмотренная свёрнутая. */
export type KeoBadgeTone = 'fill' | 'review';

/**
 * Состояние экрана КЕО: помещения, раскрытие, просмотр, предупреждения и
 * счётчик источников. Считают всё готовые модули пакета — хук их только
 * связывает.
 */
export interface KeoControl {
  rooms: readonly KeoRoomDraft[];
  /** Подписи помещений в порядке экранов: `name` либо «{roomLabel} {номер}». */
  roomLabels: readonly string[];
  /** Секции шаблона помещения — те же у всех помещений. */
  sections: readonly KeoEditorSection[];
  /** Раскрытые ключи: `conditions`, id помещения и `{id помещения}::{секция}`. */
  open: ReadonlySet<string>;
  /** Строка счётчика источников по ВСЕМУ документу. */
  counter: string;
  /** Остались непросмотренные или незаполненные цели — кнопка «Далее». */
  pending: boolean;
  /** Состояние кнопки «+ Добавить помещение»: видна, отключена или её нет. */
  addRoomState: AddItemState;
  setOpen: (keys: readonly string[], scope: KeoOpenScope) => void;
  badgeFor: (key: string) => KeoBadgeTone | undefined;
  sourceFor: (roomId: string, field: string) => CalcFieldSource | undefined;
  /** Живое значение условия: правленое пользователем либо присланное агентом. */
  conditionValue: (name: string) => string;
  isConditionEdited: (name: string) => boolean;
  /**
   * Следствие условия (`note`) считалось агентом по ПРЕЖНЕМУ значению.
   * Устарело — значит показывать его нельзя. С автосохранением не устаревает
   * никогда: ответ на черновик принесёт пересчитанное (Решение 6 design
   * `keo-editor-draft`).
   */
  isConditionNoteStale: (name: string) => boolean;
  changeCondition: (name: string, value: string) => void;
  isEdited: (roomId: string, field: string) => boolean;
  /** Предупреждения поля: правила из props плюс границы значения. */
  warningsFor: (room: KeoRoomDraft, field: CalcEditorField) => string[];
  /** Подпись плоскости и точки расчёта для значений помещения. */
  computedNoteFor: (room: KeoRoomDraft) => string | undefined;
  changeValue: (roomId: string, name: string, value: KeoFieldValue) => void;
  addRoom: () => void;
  removeRoom: (roomId: string) => void;
  /** Кнопка подвала: «Далее» ведёт по секциям, «Рассчитать» отправляет. */
  submit: () => void;
}

/**
 * Чей это аккордеон. Раскрытие живёт одним множеством на весь экран, а
 * аккордеонов на нём много: замена значения обязана трогать только ключи
 * своего списка, иначе соседний список схлопывался бы вместе с ним.
 * `outer` — «Условия» и помещения, id помещения — секции внутри него.
 */
export type KeoOpenScope = 'outer' | {roomId: string};

export interface KeoConditionsProps {
  control: KeoControl;
  conditions: readonly CalcCondition[];
}

/** Условия открытым блоком: ветка без `conditionsLabel`. */
export interface KeoConditionsSlotProps extends KeoConditionsProps {
  label: string | undefined;
}

/** Условия раскрывашкой: ветка с `conditionsLabel`. */
export interface KeoConditionsSectionProps extends KeoConditionsSlotProps {
  panelId: string;
}

export interface KeoConditionProps {
  control: KeoControl;
  condition: CalcCondition;
}

export interface KeoConditionControlProps {
  condition: CalcCondition;
  /** Живое значение: контрол управляемый, правка живёт в состоянии экрана. */
  value: string;
  onChange: (value: string) => void;
}

export interface KeoScreenProps {
  props: KeoEditorProps;
  sink: KeoSink;
}

export interface KeoRoomProps {
  control: KeoControl;
  room: KeoRoomDraft;
  title: string;
  /** Помещений больше одного — последнее не удаляется. */
  removable: boolean;
  removeLabel: string;
  panelId: (key: string) => string;
  computedLabel: string | undefined;
  purposeSection: string | undefined;
}

export interface KeoSectionProps {
  control: KeoControl;
  room: KeoRoomDraft;
  section: KeoEditorSection;
  panelId: string;
  /** Подпись вычисляемой строки — только у секции, где стоит поле назначения. */
  computedLabel: string | undefined;
}

export interface KeoFieldsProps {
  control: KeoControl;
  room: KeoRoomDraft;
  fields: readonly CalcEditorField[];
  computedLabel: string | undefined;
}

export interface KeoFieldProps {
  control: KeoControl;
  room: KeoRoomDraft;
  field: CalcEditorField;
}

export interface KeoFieldControlProps {
  field: CalcEditorField;
  value: unknown;
  onChange: (value: KeoFieldValue) => void;
}

export interface KeoFieldNotesProps {
  field: CalcEditorField;
  value: unknown;
  source: CalcFieldSource | undefined;
  edited: boolean;
  warnings: readonly string[];
}

export interface KeoSourceNoteProps {
  source: CalcFieldSource | undefined;
  edited: boolean;
  /** Подпись поля, когда источника нет и правки не было. */
  hint: string | undefined;
}

export interface KeoComputedNoteProps {
  label: string | undefined;
  value: string | undefined;
}

export interface KeoRoomMenuProps {
  removable: boolean;
  label: string;
  title: string;
  onRemove: () => void;
}

export interface KeoAddRoomProps {
  label: string;
  state: AddItemState;
  onClick: () => void;
}

export interface KeoFooterProps {
  counter: string;
  sourcesLabel: string | undefined;
  /** Кнопка ведёт по секциям, а не отправляет. Без `nextLabel` всегда `false`. */
  pending: boolean;
  /** Подпись режима навигации; её отсутствие и гасит режим (Решение 4 design). */
  nextLabel: string | undefined;
  submitLabel: string;
  onSubmit: () => void;
}

/**
 * Живые значения условий для сводки группы: правленое значение показывается,
 * а его следствие (`note`) — нет, потому что считал его агент по прежнему
 * значению (Решение 5 design).
 */
export type KeoConditionsLive = Pick<
  KeoControl,
  'conditionValue' | 'isConditionEdited' | 'isConditionNoteStale'
>;
