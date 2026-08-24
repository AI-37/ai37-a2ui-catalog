import React from 'react';
import {Button} from '../primitives';

/** Кнопка возврата: на объединённом экране её нет — без подписи не рендерится. */
export function ConstructionsNextBack({
  label,
  onBack,
}: {
  label: string | undefined;
  onBack: () => void;
}) {
  if (label === undefined) {
    return null;
  }

  return (
    <Button size="lg" onClick={onBack}>
      {label}
    </Button>
  );
}
