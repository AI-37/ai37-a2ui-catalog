import React from 'react';
import {Button} from '../primitives';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {ReportNextActionButtonProps} from './report-next-action-button.types';
import {useSurfaceReadOnly} from './surface-read-only';

/**
 * Кнопка действия отчёта: своей кнопки отчёт не заводит, берёт `Button` набора.
 *
 * Подпись идёт через `renderLabelSubscripts` («Пересчитать с h_пд 0,6») и
 * ОБЯЗАТЕЛЬНО в обёртке: `.a2ui-btn` — `inline-flex` с `gap: 6px`, и куски
 * строки без неё стали бы отдельными флекс-элементами рядом с иконкой.
 */
export function ReportNextActionButton({action, weight, onAction}: ReportNextActionButtonProps) {
  // На прошлой поверхности кнопки нет: действие ушло бы агенту и сменило диалог.
  const readOnly = useSurfaceReadOnly();
  if (action === undefined || readOnly) {
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
