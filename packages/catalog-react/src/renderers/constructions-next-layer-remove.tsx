import React from 'react';
import {Button} from '../primitives';
import type {ConstructionsNextLayerMode} from './constructions-next.types';
import {useA2uiMessages} from '../i18n';

/** «Удалить слой» есть только у правки: у формы нового слоя удалять нечего. */
export function ConstructionsNextLayerRemove({
  mode,
  onRemove,
}: {
  mode: ConstructionsNextLayerMode;
  onRemove: (() => void) | undefined;
}) {
  const m = useA2uiMessages();
  if (mode !== 'edit' || onRemove === undefined) {
    return null;
  }

  return (
    <Button size="sm" tone="danger" onClick={onRemove}>
      {m.constructions.removeLayer}
    </Button>
  );
}
