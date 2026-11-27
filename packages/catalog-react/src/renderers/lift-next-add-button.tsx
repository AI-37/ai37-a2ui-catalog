import React from 'react';
import {Button, PlusIcon} from '../primitives';
import type {LiftNextAddButtonProps} from './lift-next.types';

/**
 * «Добавить лифт» — только у методики со списком лифтов. У лифтовой группы
 * секция одна, и добавлять нечего.
 *
 * Кнопка стоит вне `Accordion.Root`: внутри него живут только секции, иначе
 * клавиатура начнёт ходить по чужим кнопкам.
 *
 * `maxLifts` из props гасит кнопку, пока предел освобождается удалением, и
 * убирает её из разметки, когда освобождать нечем (design
 * next-add-item-limit, Решения 2 и 4).
 */
export function LiftNextAddButton({perLift, label, state, onClick}: LiftNextAddButtonProps) {
  if (!perLift || state === 'hidden') {
    return null;
  }

  return (
    <div style={{justifySelf: 'start'}}>
      <Button
        variant="link"
        tone="accent"
        icon={<PlusIcon />}
        disabled={state === 'disabled'}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}
