import React from 'react';
import {Button, PlusIcon} from '../primitives';
import type {LiftNextAddButtonProps} from './lift-next.types';

/**
 * «Добавить лифт» — только у методики со списком лифтов. У лифтовой группы
 * секция одна, и добавлять нечего.
 *
 * Кнопка стоит вне `Accordion.Root`: внутри него живут только секции, иначе
 * клавиатура начнёт ходить по чужим кнопкам.
 */
export function LiftNextAddButton({perLift, label, disabled, onClick}: LiftNextAddButtonProps) {
  if (!perLift) {
    return null;
  }

  return (
    <div style={{justifySelf: 'start'}}>
      <Button variant="link" tone="accent" icon={<PlusIcon />} disabled={disabled} onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}
