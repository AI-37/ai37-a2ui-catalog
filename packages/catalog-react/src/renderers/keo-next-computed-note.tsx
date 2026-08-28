import React from 'react';
import {Field, Static} from '../primitives';
import type {KeoComputedNoteProps} from './keo-next.types';

/**
 * Плоскость и точка расчёта: не поле, а значение — его выбирает агент
 * готовой строкой, и коробка контрола звала бы это править.
 *
 * Стоит строкой формы в секции «Назначение», среди полей, от которых зависит
 * (открытый вопрос 2 design): отдельной полосой над секциями она отрывалась
 * бы от назначения и комнатности, которые её и меняют.
 */
export function KeoNextComputedNote({label, value}: KeoComputedNoteProps) {
  if (label === undefined || value === undefined) {
    return null;
  }

  return (
    <Field label={label}>
      <Static>{value}</Static>
    </Field>
  );
}
