import React from 'react';
import {Button} from '../primitives';
import type {ConstructionsNextLayerMode} from './constructions-next.types';

/** «Удалить слой» есть только у правки: у формы нового слоя удалять нечего. */
export function ConstructionsNextLayerRemove({
  mode,
  onRemove,
}: {
  mode: ConstructionsNextLayerMode;
  onRemove: (() => void) | undefined;
}) {
  if (mode !== 'edit' || onRemove === undefined) {
    return null;
  }

  return (
    <Button size="sm" tone="danger" onClick={onRemove}>
      Удалить слой
    </Button>
  );
}
