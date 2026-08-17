import type {CalcEditorField, InsolationNotice} from '@ai37/a2ui-catalog-schemas';
import type {CalcScreenState} from './calc-editor.types';

/** Рабочая копия расчётной точки — общий тип повторяемого экрана редактора. */
export type InsolationPointState = CalcScreenState;

/** Рабочая копия строки затеняющего здания (у здания нет имени). */
export type InsolationBuildingState = CalcScreenState;

export interface InsolationBuildingsProps {
  title: string;
  fields: readonly CalcEditorField[];
  buildings: readonly InsolationBuildingState[];
  addLabel: string;
  removeLabel: string;
  addDisabled: boolean;
  /** Правлено ли поле строки — метка «изменено вами». */
  isEdited: (buildingId: string, field: string) => boolean;
  onChange: (buildingId: string, field: string, value: string | boolean) => void;
  onAdd: () => void;
  onRemove: (buildingId: string) => void;
}

export interface InsolationNoticesProps {
  notices: readonly InsolationNotice[];
}
