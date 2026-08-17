import React from 'react';
import type {ThermalReportAction} from '@ai37/a2ui-catalog-schemas';
import type {ThermalReportOnAction} from './thermal-report.types';

const VARIANT_CLASS = {
  solid: 'a2ui-tr-btn a2ui-tr-btn--solid',
  outline: 'a2ui-tr-btn',
  link: 'a2ui-tr-btn a2ui-tr-btn--link',
} as const;

/** Кнопка действия отчёта: solid — «Подобрать», link — «Изменить и
 * пересчитать», «Вернуть в расчёт». Диспатч — через колбэк корня. */
export function ThermalReportActionButton({
  action,
  variant,
  onAction,
}: {
  action: ThermalReportAction;
  variant: keyof typeof VARIANT_CLASS;
  onAction: ThermalReportOnAction;
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
