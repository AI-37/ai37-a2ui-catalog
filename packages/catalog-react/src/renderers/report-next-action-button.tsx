import React from 'react';
import {Button} from '../primitives';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {ReportNextActionButtonProps} from './report-next-action-button.types';

/**
 * Кнопка действия отчёта: своей кнопки отчёт не заводит, берёт `Button` набора.
 *
 * Подпись идёт через `renderLabelSubscripts` («Пересчитать с h_пд 0,6») и
 * ОБЯЗАТЕЛЬНО в обёртке: `.a2ui-btn` — `inline-flex` с `gap: 6px`, и куски
 * строки без неё стали бы отдельными флекс-элементами рядом с иконкой.
 */
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
      <span>{renderLabelSubscripts(action.label)}</span>
    </Button>
  );
}
