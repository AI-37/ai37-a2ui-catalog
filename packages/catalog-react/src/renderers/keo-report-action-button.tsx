import React from 'react';
import type {KeoReportAction} from '@ai37/a2ui-catalog-schemas';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {KeoReportOnAction} from './keo-report.types';

const VARIANT_CLASS = {
  solid: 'a2ui-kr-btn a2ui-kr-btn--solid',
  outline: 'a2ui-kr-btn',
  link: 'a2ui-kr-btn a2ui-kr-btn--link',
} as const;

/** Кнопка действия отчёта: solid — «Пересчитать», link — «Изменить и
 * пересчитать». Диспатч — через колбэк корня (канон ThermalReport). */
export function KeoReportActionButton({
  action,
  variant,
  onAction,
}: {
  action: KeoReportAction;
  variant: keyof typeof VARIANT_CLASS;
  onAction: KeoReportOnAction;
}) {
  return (
    <button
      type="button"
      className={VARIANT_CLASS[variant]}
      data-action={action.name}
      onClick={() => onAction(action)}
    >
      {renderLabelSubscripts(action.label)}
    </button>
  );
}
