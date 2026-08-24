import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import {Button, PlusIcon} from '../primitives';
import {ConstructionsNextLayer} from './constructions-next-layer';
import type {ConstructionsNextBodyProps} from './constructions-next.types';

/** Пустой слой формы «+ Слой»: в state редактора не попадает до «Добавить». */
const EMPTY_LAYER: ConstructionLayer = {material: '', thicknessMm: null};

/**
 * Хвост списка слоёв: кнопка «Слой» либо раскрытая на её месте форма нового
 * слоя. Две ветки — два `return`, кнопка и форма друг о друге не знают.
 */
export function ConstructionsNextAddLayer({
  entry,
  condition,
  materialsReferenceId,
  minChars,
  editingTarget,
  onEditingChange,
  onChange,
  onPreviewChange,
}: ConstructionsNextBodyProps) {
  if (editingTarget !== 'new') {
    return (
      <div style={{justifySelf: 'start'}}>
        <Button
          variant="link"
          tone="accent"
          size="sm"
          icon={<PlusIcon />}
          onClick={() => onEditingChange('new')}
        >
          Слой
        </Button>
      </div>
    );
  }

  return (
    <ConstructionsNextLayer
      layer={EMPTY_LAYER}
      rowName={`material-${entry.id}-new`}
      condition={condition}
      materialsReferenceId={materialsReferenceId}
      minChars={minChars}
      mode="new"
      onCommit={layer => {
        onEditingChange(null);
        onChange({...entry, layers: [...entry.layers, layer]}, {commit: true});
      }}
      onCancel={() => onEditingChange(null)}
      onDraftChange={layer => onPreviewChange({kind: 'layer', layer})}
    />
  );
}
