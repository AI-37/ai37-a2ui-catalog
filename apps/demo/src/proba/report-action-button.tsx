import React from 'react';
import {Button} from '@ai37/a2ui-catalog-react/primitives';
import {dispatchReportAction} from './dispatch-report-action';
import type {ReportActionButtonProps} from './report-action-button.types';

/** Кнопка действия отчёта: своей кнопки отчёт не заводит, берёт `Button` набора. */
export function ReportActionButton({action, weight}: ReportActionButtonProps) {
  if (action === undefined) {
    return null;
  }

  return (
    <Button
      variant={weight}
      tone={weight === 'link' ? 'accent' : 'neutral'}
      onClick={() => dispatchReportAction(action)}
    >
      {action.label}
    </Button>
  );
}
