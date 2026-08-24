import React from 'react';
import {ConstructionsNextAddLayer} from './constructions-next-add-layer';
import {ConstructionsNextLayer} from './constructions-next-layer';
import type {ConstructionsNextBodyProps} from './constructions-next.types';

/**
 * Слои конструкции: строки-сводки, одна из которых может быть раскрыта в
 * форму, и хвост «Слой». Открытие другой строки переводит единственную форму
 * редактора туда — несохранённые правки прежней уходят вместе с её формой.
 */
export function ConstructionsNextLayers(props: ConstructionsNextBodyProps) {
  const {entry, condition, materialsReferenceId, minChars, editingTarget, onEditingChange, onChange, onPreviewChange} =
    props;

  return (
    <>
      {entry.layers.map((layer, index) => (
        <ConstructionsNextLayer
          key={index}
          layer={layer}
          rowName={`material-${entry.id}-${index}`}
          condition={condition}
          materialsReferenceId={materialsReferenceId}
          minChars={minChars}
          mode={editingTarget === index ? 'edit' : 'summary'}
          onOpen={() => onEditingChange(index)}
          onCommit={next => {
            onEditingChange(null);
            onChange(
              {...entry, layers: entry.layers.map((prev, i) => (i === index ? next : prev))},
              {commit: true},
            );
          }}
          onCancel={() => onEditingChange(null)}
          onRemove={() => {
            onEditingChange(null);
            onChange({...entry, layers: entry.layers.filter((_, i) => i !== index)}, {commit: true});
          }}
          onDraftChange={layer_ => onPreviewChange({kind: 'layer', layer: layer_})}
        />
      ))}
      <ConstructionsNextAddLayer {...props} />
    </>
  );
}
