import type React from 'react';
import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
  ConstructionsFieldSource,
  ConstructionsGeneral,
  ConstructionsGeneralSources,
} from '@ai37/a2ui-catalog-schemas';
import type {
  ConstructionHeaderFields,
  ConstructionsEditorFormTarget,
  ConstructionsGeneralKey,
  OperatingCondition,
} from './constructions-editor.types';

/** Поля формы условий и подъём правок наверх — то же, чем владеет редактор. */
export type ConstructionsNextGeneralProps = {
  general: ConstructionsGeneral;
  /** Источники значений без тронутых полей: подпись под контролом. */
  sources: ConstructionsGeneralSources;
  buildingTypeOptions?: string[] | undefined;
  /** Без справочника поле города остаётся обычным вводом без подсказок. */
  cityReferenceId?: string | undefined;
  minChars?: number | undefined;
  /** Правка: новый блок целиком и ключи, которых коснулся пользователь. */
  onChange: (general: ConstructionsGeneral, touched: ConstructionsGeneralKey[]) => void;
};

export type ConstructionsNextConditionsProps = ConstructionsNextGeneralProps & {
  /** Раскрыт ли блок; состояние локальное, наружу не уезжает. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type ConstructionsNextSourceNoteProps = {
  source: ConstructionsFieldSource | undefined;
};

export type ConstructionsNextCardProps = {
  entry: ConstructionEntry;
  typeConfigs: ConstructionTypeConfig[];
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  /** false — климат тронут, Rнорм протух: чип показывает Rпр без сравнения. */
  showRnorm: boolean;
  /** false — гейт условий закрыт: статусных пометок нет, остаётся только Rпр. */
  showStatusChips: boolean;
  /** Агентский статус карточки погашен на клиенте просмотром или правкой. */
  statusDismissed: boolean;
  /** Форма этой карточки, раскрытая сейчас (null — все свёрнуты). */
  editingTarget: ConstructionsEditorFormTarget | null;
  onEditingChange: (target: ConstructionsEditorFormTarget | null) => void;
  /** Правка конструкции; `commit: true` — явный коммит формы. */
  onChange: (entry: ConstructionEntry, options?: {commit?: boolean}) => void;
  onRemove: () => void;
  /** Якорь навигации кнопки-«Далее»: карточку нужно найти и проскроллить. */
  entryRef: (element: HTMLDivElement | null) => void;
};

/** Тело раскрытой карточки — всё, кроме шапки: она общая для обоих состояний. */
export type ConstructionsNextBodyProps = Omit<
  ConstructionsNextCardProps,
  'showRnorm' | 'showStatusChips' | 'statusDismissed' | 'onRemove' | 'entryRef'
> & {
  config: ConstructionTypeConfig | undefined;
  /** Черновик открытой формы — только для чипа Rпр карточки. */
  onPreviewChange: (preview: ConstructionsNextPreview | null) => void;
};

/**
 * Черновик открытой формы для превью Rпр: слой (edit/new) или паспортное
 * значение. Живёт только в карточке и только на чип — state редактора,
 * сводки и черновики агенту его не видят.
 */
export type ConstructionsNextPreview =
  | {kind: 'layer'; layer: ConstructionLayer}
  | {kind: 'passport'; value: number | undefined};

export type ConstructionsNextHeaderRowProps = {
  entry: ConstructionEntry;
  typeConfigs: ConstructionTypeConfig[];
  /** true — вместо режима чтения раскрыта форма шапки. */
  editing: boolean;
  onOpen: () => void;
  onCommit: (fields: ConstructionHeaderFields) => void;
  onCancel: () => void;
};

export type ConstructionsNextPassportProps = {
  /** Паспортное Rпр из состояния редактора; undefined — «не задано». */
  value: number | undefined;
  editing: boolean;
  onOpen: () => void;
  onCommit: (value: number | undefined) => void;
  onCancel: () => void;
  /** Каждое изменение черновика формы — для превью Rпр в карточке. */
  onDraftChange: (value: number | undefined) => void;
};

/** Режим строки слоя: сводка, форма правки или форма нового слоя. */
export type ConstructionsNextLayerMode = 'summary' | 'edit' | 'new';

export type ConstructionsNextLayerProps = {
  layer: ConstructionLayer;
  /** name скрытого input'а lookup'а; уникален в пределах surface'а. */
  rowName: string;
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  mode: ConstructionsNextLayerMode;
  /** Клик по строке-сводке — открыть форму этого слоя. */
  onOpen?: (() => void) | undefined;
  /** Коммит формы: «Применить» с изменёнными полями либо «Добавить». */
  onCommit: (layer: ConstructionLayer) => void;
  onCancel: () => void;
  /** «Удалить слой» из формы; у формы нового слоя кнопки нет. */
  onRemove?: (() => void) | undefined;
  /** Каждое изменение черновика формы — для превью Rпр в карточке. */
  onDraftChange: (layer: ConstructionLayer) => void;
};

export type ConstructionsNextFooterProps = {
  backLabel: string | undefined;
  onBack: () => void;
  /** Подпись главной кнопки: submit либо pending-навигация. */
  submitLabel: string;
  onSubmit: () => void;
  /** Счётчик «проходит N из M»; null — климат тронут, сводка молчит. */
  counter: React.ReactNode;
};

export type ConstructionsNextListProps = {
  entries: ConstructionEntry[];
  typeConfigs: ConstructionTypeConfig[];
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  showRnorm: boolean;
  showStatusChips: boolean;
  /** Погашенные агентские статусы: живут до submit, ключ — `id` карточки. */
  dismissedStatusIds: ReadonlySet<string>;
  /** Раскрытая карточка; аккордеон одиночный, поэтому одна или ни одной. */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  /** Единственная форма редактора: чья она и какая. */
  editing: {entryId: string; target: ConstructionsEditorFormTarget} | null;
  onEditingChange: (entryId: string, target: ConstructionsEditorFormTarget | null) => void;
  onEntryChange: (entry: ConstructionEntry, options?: {commit?: boolean}) => void;
  onEntryRemove: (id: string) => void;
  addLabel: string;
  onAdd: () => void;
  /** Якоря навигации кнопки-«Далее». */
  entryRef: (id: string, element: HTMLDivElement | null) => void;
};
