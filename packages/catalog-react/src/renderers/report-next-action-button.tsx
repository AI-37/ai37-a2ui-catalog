import React from 'react';
import {Button} from '../primitives';
import type {ReportNextActionButtonProps} from './report-next-action-button.types';

/** Кнопка действия отчёта: своей кнопки отчёт не заводит, берёт `Button` набора. */
export function ReportNextActionButton({action, weight, onAction}: ReportNextActionButtonProps) {
  if (action === undefined) {
    return null;
  }

  return (
    <Button
      variant={weight}
      tone={weight === 'link' ? 'accent' : 'neutral'}
      onClick={() => onAction(action)}
    >
      {action.label}
    </Button>
  );
}
