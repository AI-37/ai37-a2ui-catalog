import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
  ConstructionsEditorProps,
  ConstructionsGeneral,
} from '@ai37/a2ui-catalog-schemas';

/** Условие эксплуатации ограждающих конструкций (выбор λА/λБ). */
export type OperatingCondition = ConstructionsEditorProps['condition'];

/** Вкладка объединённого экрана. */
export type ConstructionsEditorTab = 'general' | 'constructions';

/** Климат, вычитанный из опции справочника городов; нет поля — нет ключа. */
export type ConstructionsClimatePatch = Partial<Pick<ConstructionsGeneral, 'tot' | 'zot' | 'tn'>>;

export type ConstructionsEditorTabsProps = {
  active: ConstructionsEditorTab;
  generalLabel: string;
  constructionsLabel: string;
  onSelect: (tab: ConstructionsEditorTab) => void;
};

export type ConstructionsEditorGeneralProps = {
  general: ConstructionsGeneral;
  buildingTypeOptions?: string[] | undefined;
  /** Без справочника поле города остаётся обычным вводом без подсказок. */
  cityReferenceId?: string | undefined;
  minChars?: number | undefined;
  onChange: (general: ConstructionsGeneral) => void;
};

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
   * Слой этой карточки, которым владеет форма ('new' — форма нового слоя).
   * Состояние живёт в редакторе: форма одна на весь редактор, а не на карточку.
   */
  editingIndex: number | 'new' | null;
  onEditingChange: (index: number | 'new' | null) => void;
  onToggle: () => void;
  /**
   * Правка конструкции. `commit: true` — явный коммит формы слоя
   * («Применить»/«Добавить»/«Удалить слой»): точка отправки черновика.
   */
  onChange: (entry: ConstructionEntry, options?: {commit?: boolean}) => void;
  onRemove: () => void;
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
