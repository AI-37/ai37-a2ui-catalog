import type {
  CalcCondition,
  CalcEditorField,
  CalcFieldSource,
  CalcFieldSourceKind,
  CalcFieldSources,
} from '@ai37/a2ui-catalog-schemas';

/**
 * Префикс классов конкретного расчётного редактора: `ke` — КЕО, `ie` —
 * инсоляция. Общие файлы-хелперы рендерера (поле, подпись источника) параметризованы
 * им, чтобы стили компонентов оставались независимыми (Решение 5 design
 * insolation-editor: переиспользуем куски, а не заводим общий генерик-компонент).
 */
export type CalcEditorPrefix = 'ke' | 'ie';

/** Значения одного экрана (помещения, расчётной точки, здания). */
export type CalcFieldValues = Record<string, unknown>;

export interface CalcEditorFieldProps {
  prefix: CalcEditorPrefix;
  field: CalcEditorField;
  value: unknown;
  /** Источник значения из props; `undefined` — источника нет. */
  source?: CalcFieldSource | undefined;
  /** Поле правлено пользователем — метка становится «изменено вами». */
  edited: boolean;
  /** Предупреждения «! проверить»: правила из props плюс диапазон поля. */
  warnings: readonly string[];
  onChange: (value: string | boolean) => void;
}

export interface CalcSourceNoteProps {
  prefix: CalcEditorPrefix;
  source?: CalcFieldSource | undefined;
  edited: boolean;
  /** Подпись поля, когда источника нет и правки не было. */
  hint?: string | undefined;
}

/** Слагаемое счётчика источников: одно отрисованное поле со значением. */
export interface CalcSourceItem {
  source?: CalcFieldSource | undefined;
  edited: boolean;
}

/** Счётчик по видам источника плюс `edited` — правленные пользователем поля. */
export type CalcSourceCounts = Partial<Record<CalcFieldSourceKind | 'edited', number>>;

export interface CalcConditionsProps {
  prefix: CalcEditorPrefix;
  conditions: readonly CalcCondition[];
}

export interface CalcTabsProps {
  prefix: CalcEditorPrefix;
  /** Подписи вкладок в порядке экранов. */
  labels: readonly string[];
  activeIndex: number;
  addLabel: string;
  addDisabled: boolean;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

/**
 * Рабочая копия одного повторяемого экрана (помещения КЕО, расчётной точки или
 * затеняющего здания инсоляции). `id` — клиентский ключ React-списка и префикс
 * ключей правленных полей: индекс переехал бы на соседа при удалении экрана из
 * середины.
 */
export interface CalcScreenState {
  id: string;
  name?: string | undefined;
  values: CalcFieldValues;
  sources: CalcFieldSources;
}
