import React from 'react';
import {ConstructionsNextLayers} from './constructions-next-layers';
import {ConstructionsNextPassport} from './constructions-next-passport';
import type {ConstructionsNextBodyProps} from './constructions-next.types';

/**
 * Состав конструкции: у типов со слоями — таблица слоёв, у окон/фонарей/дверей
 * — паспортное Rпр. Ветка по конфигу типа, а не по наличию слоёв: пустой
 * список слоёв у стены — это стена без состава, а не окно.
 */
export function ConstructionsNextContent(props: ConstructionsNextBodyProps) {
  const {entry, config, editingTarget, onEditingChange, onChange, onPreviewChange} = props;

  if (config && !config.hasLayers) {
    return (
      <ConstructionsNextPassport
        value={entry.rprPassport}
        editing={editingTarget === 'passport'}
        onOpen={() => onEditingChange('passport')}
        onCommit={rprPassport => {
          onEditingChange(null);
          onChange({...entry, rprPassport}, {commit: true});
        }}
        onCancel={() => onEditingChange(null)}
        onDraftChange={value => onPreviewChange({kind: 'passport', value})}
      />
    );
  }

  return <ConstructionsNextLayers {...props} />;
}
