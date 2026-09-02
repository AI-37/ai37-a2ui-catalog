import type React from 'react';
import type {
  LiftEditorField,
  LiftEditorFieldSource,
  LiftEditorMethodConfig,
  LiftEditorSectionSources,
} from '@ai37/a2ui-catalog-schemas';
import type {AddItemState} from './add-item-state.types';
import type {LiftEditorDraft, LiftFieldOption, LiftFieldValues, LiftSectionKey} from './lift-editor.types';
import type {OnApplyRecommendation} from './recommend.types';

/** Значение поля редактора: числовое поле отдаёт `null`, остальные — строку. */
export type LiftNextFieldValue = string | number | boolean | null;

/** Документ активной ветки: общий payload submit'а и черновика. */
export interface LiftNextDocument {
  method: string;
  building: LiftFieldValues;
  lifts: LiftFieldValues[];
}

/**
 * Куда уезжает состояние экрана. Рендерер подставляет `dispatchAction`,
 * песочница — консоль: экран один, а получатель у него разный.
 *
 * `onDraft` необязателен: без `draftAction` автосейва нет — черновики не
 * собираются и таймер не заводится.
 */
export interface LiftNextSink {
  onDraft?: ((document: LiftNextDocument) => void) | undefined;
  onSubmit: (document: LiftNextDocument) => void;
}

export interface LiftNextControl {
  /** Конфиг активной методики: состав полей обеих секций и правила. */
  config: LiftEditorMethodConfig;
  draft: LiftEditorDraft;
  /** `per-lift` — секции «Лифт 1…N» с добавлением и удалением. */
  perLift: boolean;
  /** Порядок секций экрана: «Здание», затем лифты. */
  sectionOrder: LiftSectionKey[];
  /** Раскрытые секции — управляемое значение аккордеона. */
  openSections: LiftSectionKey[];
  badgeFor: (key: LiftSectionKey) => LiftNextBadgeTone | undefined;
  /** Источники значений секции без полей, правленных вручную. */
  sourcesFor: (key: LiftSectionKey) => LiftEditorSectionSources;
  /** Текст типа здания для шапки: живое значение поля или подпись конфига. */
  buildingKind: string;
  /** Остались непросмотренные или незаполненные секции — кнопка «Далее». */
  pending: boolean;
  /**
   * Кнопка заблокирована: путь отката без `pendingLabel`, где незаполненный
   * документ не отправляется вовсе. С `pendingLabel` блокировки нет — по
   * секциям ведёт «Далее».
   */
  blocked: boolean;
  /** Состояние кнопки «Добавить лифт»: видна, отключена или её нет. */
  addLiftState: AddItemState;
  setOpenSections: (next: LiftSectionKey[]) => void;
  changeMethod: (method: string) => void;
  changeValue: (key: LiftSectionKey, name: string, value: LiftNextFieldValue) => void;
  addLift: () => void;
  removeLift: (index: number) => void;
  /** Применение варианта подбора: перестраивает лифтовые секции и шлёт черновик. */
  applyRecommendation: OnApplyRecommendation;
  /** Кнопка подвала: «Далее» ведёт по секциям, «Рассчитать» отправляет. */
  submit: () => void;
  bindSection: (key: LiftSectionKey) => (node: HTMLElement | null) => void;
}

/** Пометка секции: незаполненные обязательные поля либо непросмотренная свёрнутая. */
export type LiftNextBadgeTone = 'fill' | 'review';

export interface LiftNextBadgeProps {
  /** `undefined` — пометки нет: у раскрытой заполненной секции её и не должно быть. */
  tone: LiftNextBadgeTone | undefined;
}

export interface LiftNextFieldsProps {
  /** id панели блока дефолтов — уникальный в пределах страницы. */
  advancedId: string;
  fields: readonly LiftEditorField[];
  values: LiftFieldValues;
  /** Значения здания: источник рядов и правил со `scope: 'building'`. */
  building: LiftFieldValues;
  advancedLabel: string;
  sources: LiftEditorSectionSources;
  onChange: (name: string, value: LiftNextFieldValue) => void;
}

export interface LiftNextFieldProps {
  field: LiftEditorField;
  value: unknown;
  options: readonly LiftFieldOption[];
  sources: LiftEditorSectionSources;
  onChange: (name: string, value: LiftNextFieldValue) => void;
}

export interface LiftNextFieldControlProps {
  field: LiftEditorField;
  value: unknown;
  options: readonly LiftFieldOption[];
  onChange: (name: string, value: LiftNextFieldValue) => void;
}

export interface LiftNextFieldNoteProps {
  /** Источник значения; `undefined` — поле правлено или источника не было. */
  source: LiftEditorFieldSource | undefined;
  hint: string | undefined;
}

export interface LiftNextAdvancedProps {
  panelId: string;
  label: string;
  fields: readonly LiftEditorField[];
  values: LiftFieldValues;
  renderField: (field: LiftEditorField) => React.ReactNode;
}

export interface LiftNextAdvancedSummaryProps {
  fields: readonly LiftEditorField[];
  values: LiftFieldValues;
}

export interface LiftNextAddButtonProps {
  perLift: boolean;
  label: string;
  state: AddItemState;
  onClick: () => void;
}

export interface LiftNextRemoveButtonProps {
  perLift: boolean;
  /** Сколько лифтов в ветке: последний не удаляется. */
  count: number;
  /** Номер лифта для доступного имени: «Удалить лифт» без номера неоднозначно. */
  index: number;
  label: string;
  onClick: () => void;
}

export interface LiftNextMethodSwitcherProps {
  configs: readonly LiftEditorMethodConfig[];
  method: string;
  /** Текст типа здания: значение `buildingType` либо `buildingKindLabel`. */
  buildingKind: string;
  onChange: (method: string) => void;
}
