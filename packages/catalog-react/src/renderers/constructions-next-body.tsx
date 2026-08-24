import React from 'react';
import {CardBody} from '../primitives';
import {ConstructionsNextContent} from './constructions-next-content';
import {ConstructionsNextHeaderRow} from './constructions-next-header-row';
import type {ConstructionsNextBodyProps} from './constructions-next.types';

/**
 * Тело раскрытой карточки: строка типа с «Изменить» и состав конструкции.
 * Показом тела владеет панель аккордеона, поэтому состояния раскрытия здесь
 * нет — переключается только оно, шапка и подложка общие.
 */
export function ConstructionsNextBody(props: ConstructionsNextBodyProps) {
  const {entry, typeConfigs, editingTarget, onEditingChange, onChange} = props;

  return (
    <CardBody>
      <ConstructionsNextHeaderRow
        entry={entry}
        typeConfigs={typeConfigs}
        editing={editingTarget === 'header'}
        onOpen={() => onEditingChange('header')}
        onCommit={fields => {
          onEditingChange(null);
          onChange({...entry, ...fields}, {commit: true});
        }}
        onCancel={() => onEditingChange(null)}
      />
      <ConstructionsNextContent {...props} />
    </CardBody>
  );
}
