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
  onToggle: () => void;
  onChange: (entry: ConstructionEntry) => void;
  onRemove: () => void;
};

export type ConstructionsEditorLayerRowProps = {
  layer: ConstructionLayer;
  /** name скрытого input'а комбобокса; уникален в пределах surface'а. */
  rowName: string;
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  onChange: (layer: ConstructionLayer) => void;
  onRemove: () => void;
};
