import type React from 'react';
import type {
  LiftEditorField,
  LiftEditorFieldSource,
  LiftEditorMethodConfig,
  LiftEditorSectionSources,
} from '@ai37/a2ui-catalog-schemas';

/** Значения одного экрана (здания или лифта): имя поля → введённое значение. */
export type LiftFieldValues = Record<string, unknown>;

/** Рабочая копия документа одной методики. */
export interface LiftEditorDraft {
  building: LiftFieldValues;
  lifts: LiftFieldValues[];
}

/**
 * Черновики по методикам. Значения не переносятся между ветками по совпадению
 * имён: `A` в 52941 и в 34758 — разные величины (Решение 4 design.md).
 */
export type LiftEditorDrafts = Record<string, LiftEditorDraft>;

/** Ключ секции экрана: здание либо `lift-<индекс>`. */
export type LiftSectionKey = 'building' | `lift-${number}`;

/**
 * Источники значений одной методики. Живут локальным состоянием рядом с
 * черновиком: add/remove лифта сдвигают массив вместе с секциями, чтобы
 * подпись не переехала на соседний лифт.
 */
export interface LiftEditorSources {
  building: LiftEditorSectionSources;
  lifts: LiftEditorSectionSources[];
}

export type LiftEditorSourcesByMethod = Record<string, LiftEditorSources>;

/** Вариант списка: значение уходит в submit, `note` — пояснение к ряду. */
export interface LiftFieldOption {
  value: string;
  label: string;
  note?: string;
}

export interface LiftEditorFieldProps {
  field: LiftEditorField;
  value: unknown;
  options: readonly LiftFieldOption[];
  missing: boolean;
  /** Источник значения; `undefined` — поле правлено или источника нет. */
  source?: LiftEditorFieldSource | undefined;
  onChange: (value: string | boolean) => void;
}

export interface LiftEditorSourceNoteProps {
  source: LiftEditorFieldSource;
}

export interface LiftEditorAdvancedProps {
  label: string;
  fields: readonly LiftEditorField[];
  /** Текущие значения экрана — сводка свёрнутого блока собирается из них. */
  values: LiftFieldValues;
  renderField: (field: LiftEditorField) => React.ReactNode;
}

export interface LiftEditorScreenProps {
  fields: readonly LiftEditorField[];
  values: LiftFieldValues;
  /** Значения экрана здания — источник опций и правил со `scope: 'building'`. */
  building: LiftFieldValues;
  advancedLabel: string;
  /** Источники значений экрана, уже без тронутых полей. */
  sources: LiftEditorSectionSources;
  onChange: (name: string, value: string | boolean) => void;
}

/** Пометка секции: пустые обязательные поля либо непросмотренная свёрнутая. */
export type LiftSectionBadge = 'fill' | 'review';

export interface LiftEditorSectionProps {
  title: string;
  /** Строка-сводка свёрнутого вида; пустая — «не заполнено». */
  summary: string;
  open: boolean;
  badge?: LiftSectionBadge | undefined;
  onToggle: () => void;
  /** Действие в шапке раскрытой секции («Удалить лифт»). */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  /** Якорь секции для прокрутки навигацией кнопки `pendingLabel`. */
  sectionRef?: (node: HTMLElement | null) => void;
}

export interface LiftEditorMethodSwitcherProps {
  configs: readonly LiftEditorMethodConfig[];
  method: string;
  /** Подпись select'а — из `methodField.label`. */
  fieldLabel: string;
  /** Текст типа здания: значение `buildingType` либо `buildingKindLabel`. */
  buildingKind: string;
  onChange: (method: string) => void;
}

export interface LiftEditorHeaderProps {
  title: string;
  context?: string | undefined;
  switcher: React.ReactNode;
}

export type {LiftEditorField, LiftEditorFieldSource, LiftEditorMethodConfig, LiftEditorSectionSources};
