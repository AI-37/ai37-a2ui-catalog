import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
  ConstructionsEditorProps,
  ConstructionsFieldSource,
  ConstructionsGeneral,
  ConstructionsGeneralSources,
} from '@ai37/a2ui-catalog-schemas';

/** Условие эксплуатации ограждающих конструкций (выбор λА/λБ). */
export type OperatingCondition = ConstructionsEditorProps['condition'];

/** Ключ поля общих данных — он же ключ записи в `generalSources`. */
export type ConstructionsGeneralKey = keyof ConstructionsGeneral;

/** Климат, вычитанный из опции справочника городов; нет поля — нет ключа. */
export type ConstructionsClimatePatch = Partial<Pick<ConstructionsGeneral, 'tot' | 'zot' | 'tn'>>;

export type ConstructionsEditorGeneralProps = {
  general: ConstructionsGeneral;
  /**
   * Источники значений, которых пользователь ещё не касался: тронутое поле
   * стало пользовательским и оформления источника не получает.
   */
  sources: ConstructionsGeneralSources;
  /** false — климат тронут: присланный ГСОП протух и не показывается. */
  showGsop: boolean;
  buildingTypeOptions?: string[] | undefined;
  /** Без справочника поле города остаётся обычным вводом без подсказок. */
  cityReferenceId?: string | undefined;
  minChars?: number | undefined;
  /** Правка: новый блок целиком и ключи, которых коснулся пользователь. */
  onChange: (general: ConstructionsGeneral, touched: ConstructionsGeneralKey[]) => void;
};

export type ConstructionsEditorConditionsProps = ConstructionsEditorGeneralProps & {
  /** Раскрыт ли блок; состояние локальное, наружу не уезжает. */
  open: boolean;
  onToggle: () => void;
};

export type ConstructionsEditorSourceNoteProps = {
  source: ConstructionsFieldSource;
};

export type ConstructionsEditorSelectProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Класс самого `select` — оформление контрола, в т.ч. по источнику. */
  className: string;
  children: React.ReactNode;
};

/**
 * Что именно раскрыто в единственной форме редактора: слой по индексу,
 * новый слой, шапка карточки или паспортное Rпр.
 */
export type ConstructionsEditorFormTarget = number | 'new' | 'header' | 'passport';

export type ConstructionsEditorCardProps = {
  entry: ConstructionEntry;
  typeConfigs: ConstructionTypeConfig[];
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  open: boolean;
  /** false — климат тронут, Rнорм протух: чип показывает Rпр без сравнения. */
  showRnorm: boolean;
  /**
   * Форма этой карточки, раскрытая сейчас (null — все свёрнуты). Состояние
   * живёт в редакторе: форма одна на весь редактор любого вида, а не на карточку.
   */
  editingTarget: ConstructionsEditorFormTarget | null;
  onEditingChange: (target: ConstructionsEditorFormTarget | null) => void;
  onToggle: () => void;
  /**
   * Правка конструкции. `commit: true` — явный коммит формы (слоя, шапки или
   * паспортного Rпр): точка отправки черновика.
   */
  onChange: (entry: ConstructionEntry, options?: {commit?: boolean}) => void;
  onRemove: () => void;
};

/** Поля шапки карточки — то, чем владеет её форма. */
export type ConstructionHeaderFields = Pick<ConstructionEntry, 'type' | 'subtype' | 'name'>;

export type ConstructionsEditorCardHeaderProps = {
  entry: ConstructionEntry;
  typeConfigs: ConstructionTypeConfig[];
  /** true — вместо режима чтения раскрыта форма шапки. */
  editing: boolean;
  /** «Изменить» — забрать единственную форму редактора себе. */
  onOpen: () => void;
  /** «Сохранить» с изменёнными полями. */
  onCommit: (fields: ConstructionHeaderFields) => void;
  /** «Отмена» (и «Сохранить» без изменений): закрыть форму без следа. */
  onCancel: () => void;
};

export type ConstructionsEditorPassportProps = {
  /** Паспортное Rпр из состояния редактора; undefined — «не задано». */
  value: number | undefined;
  editing: boolean;
  onOpen: () => void;
  /** «Применить» с изменённым значением. */
  onCommit: (value: number | undefined) => void;
  onCancel: () => void;
};

/** Режим строки слоя: сводка, форма правки или форма нового слоя. */
export type ConstructionsEditorLayerRowMode = 'summary' | 'edit' | 'new';

export type ConstructionsEditorLayerRowProps = {
  layer: ConstructionLayer;
  /** Порядковый номер строки для «№» сводки (с нуля). */
  index: number;
  /** name скрытого input'а комбобокса; уникален в пределах surface'а. */
  rowName: string;
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  mode: ConstructionsEditorLayerRowMode;
  /** Клик по строке-сводке — открыть форму этого слоя. */
  onOpen?: () => void;
  /** Коммит формы: «Применить» с изменёнными полями либо «Добавить». */
  onCommit: (layer: ConstructionLayer) => void;
  /** Закрыть форму, отбросив несохранённые правки. */
  onCancel: () => void;
  /** «Удалить слой» из формы; у формы нового слоя кнопки нет. */
  onRemove?: () => void;
};
