import type React from 'react';
import type {LiftEditorField, LiftEditorMethodConfig} from '@ai37/a2ui-catalog-schemas';

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

/** Активная вкладка: экран здания либо индекс лифта. */
export type LiftEditorTab = 'building' | number;

/** Вариант списка: значение уходит в submit, `note` — пояснение к ряду. */
export interface LiftFieldOption {
  value: string;
  label: string;
  note?: string;
}

export interface LiftEditorTabsProps {
  active: LiftEditorTab;
  buildingLabel: string;
  liftTabLabel: string;
  perLift: boolean;
  liftCount: number;
  addLabel: string;
  canAdd: boolean;
  /** Вкладки с незаполненными обязательными полями: 'building' и индексы лифтов. */
  incomplete: ReadonlySet<LiftEditorTab>;
  onSelect: (tab: LiftEditorTab) => void;
  onAdd: () => void;
}

export interface LiftEditorFieldProps {
  field: LiftEditorField;
  value: unknown;
  options: readonly LiftFieldOption[];
  missing: boolean;
  onChange: (value: string | boolean) => void;
  /** Поле потеряло фокус, и значение изменилось с момента его получения. */
  onCommit?: (() => void) | undefined;
}

export interface LiftEditorAdvancedProps {
  label: string;
  fields: readonly LiftEditorField[];
  renderField: (field: LiftEditorField) => React.ReactNode;
}

export interface LiftEditorScreenProps {
  title: string;
  gostLabel: string;
  fields: readonly LiftEditorField[];
  values: LiftFieldValues;
  /** Значения экрана здания — источник опций и правил со `scope: 'building'`. */
  building: LiftFieldValues;
  advancedLabel: string;
  /** Экран здания открывается выбором методики (Решение 3 design.md). */
  methodSelect?: {
    field: LiftEditorField;
    value: string;
    options: readonly LiftFieldOption[];
    onChange: (value: string) => void;
  };
  onChange: (name: string, value: string | boolean) => void;
  /** Поле экрана потеряло фокус с изменённым значением — повод для черновика. */
  onCommit?: (() => void) | undefined;
}

export type {LiftEditorField, LiftEditorMethodConfig};
