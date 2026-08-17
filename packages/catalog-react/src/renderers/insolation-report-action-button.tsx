import React from 'react';
import type {InsolationReportAction} from '@ai37/a2ui-catalog-schemas';
import type {InsolationReportOnAction} from './insolation-report.types';

const VARIANT_CLASS = {
  solid: 'a2ui-ir-btn a2ui-ir-btn--solid',
  outline: 'a2ui-ir-btn',
  link: 'a2ui-ir-btn a2ui-ir-btn--link',
} as const;

/** Кнопка действия отчёта: link — «Изменить и пересчитать», «Посчитать по
 * проекту». Диспатч — через колбэк корня (канон ThermalReport). */
export function InsolationReportActionButton({
  action,
  variant,
  onAction,
}: {
  action: InsolationReportAction;
  variant: keyof typeof VARIANT_CLASS;
  onAction: InsolationReportOnAction;
}) {
  return (
    <button
      type="button"
      className={VARIANT_CLASS[variant]}
      data-action={action.name}
      onClick={() => onAction(action)}
    >
      {action.label}
    </button>
  );
}
