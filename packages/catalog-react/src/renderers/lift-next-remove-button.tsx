import React from 'react';
import {Button} from '../primitives';
import type {LiftNextRemoveButtonProps} from './lift-next.types';

/**
 * «Удалить лифт» в шапке секции. Последний лифт не удаляется: документ без
 * лифтов не расчёт, а пустой бланк.
 *
 * Подпись одна на все секции («Удалить лифт»), поэтому доступное имя несёт ещё
 * и номер: иначе диктор читает подряд несколько одинаковых кнопок.
 */
export function LiftNextRemoveButton({
  perLift,
  count,
  index,
  label,
  onClick,
}: LiftNextRemoveButtonProps) {
  if (!perLift || count <= 1) {
    return null;
  }

  return (
    <Button
      variant="link"
      tone="danger"
      size="sm"
      aria-label={`${label} ${index + 1}`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
