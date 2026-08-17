import React from 'react';
import type {LiftReportAction} from '@ai37/a2ui-catalog-schemas';
import type {LiftReportOnAction} from './lift-report.types';

const VARIANT_CLASS = {
  solid: 'a2ui-lr-btn a2ui-lr-btn--solid',
  outline: 'a2ui-lr-btn',
  link: 'a2ui-lr-btn a2ui-lr-btn--link',
} as const;

/** Кнопка действия отчёта: outline — «Пересчитать» у варианта «Что изменить»,
 * link — «Изменить и пересчитать» в шапке исходных данных. Диспатч — через
 * колбэк корня. */
export function LiftReportActionButton({
  action,
  variant,
  onAction,
}: {
  action: LiftReportAction;
  variant: keyof typeof VARIANT_CLASS;
  onAction: LiftReportOnAction;
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
