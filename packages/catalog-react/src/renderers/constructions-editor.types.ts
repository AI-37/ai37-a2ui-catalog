import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
  ConstructionsEditorProps,
} from '@ai37/a2ui-catalog-schemas';

/** Условие эксплуатации ограждающих конструкций (выбор λА/λБ). */
export type OperatingCondition = ConstructionsEditorProps['condition'];

/** Ошибки клиентской валидации одной строки слоя (подсветка при submit). */
export type LayerRowErrors = {
  material: boolean;
  thickness: boolean;
  lambda: boolean;
};

/** Ошибки одной конструкции: паспортное Rпр и строки слоёв по индексу. */
export type ConstructionErrors = {
  rprPassport: boolean;
  layers: Map<number, LayerRowErrors>;
};

/** Итог клиентской валидации всех конструкций перед submit. */
export type ConstructionsValidation = {
  valid: boolean;
  byEntryId: Map<string, ConstructionErrors>;
};

export type ConstructionsEditorCardProps = {
  entry: ConstructionEntry;
  typeConfigs: ConstructionTypeConfig[];
  condition: OperatingCondition;
  materialsReferenceId: string;
  minChars?: number | undefined;
  open: boolean;
  /** undefined — ошибки не показываются (submit ещё не нажимался или всё валидно). */
  errors?: ConstructionErrors | undefined;
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
  errors?: LayerRowErrors | undefined;
  onChange: (layer: ConstructionLayer) => void;
  onRemove: () => void;
};
