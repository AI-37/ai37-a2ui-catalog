import type React from 'react';
import type {KeoEditorSection} from '@ai37/a2ui-catalog-schemas';
import type {CalcScreenState} from './calc-editor.types';

/** Рабочая копия одного помещения — общий тип повторяемого экрана редактора. */
export type KeoRoomState = CalcScreenState;

export interface KeoEditorSectionProps {
  section: KeoEditorSection;
  /** Сводка принятых значений — показывается у свёрнутой секции-экспандера. */
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
