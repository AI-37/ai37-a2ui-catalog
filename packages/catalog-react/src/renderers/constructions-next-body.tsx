import React from 'react';
import {CardBody} from '../primitives';
import {ConstructionsNextContent} from './constructions-next-content';
import {ConstructionsNextHeaderRow} from './constructions-next-header-row';
import {withHeaderFields} from './with-header-fields';
import type {ConstructionsNextBodyProps} from './constructions-next.types';

/**
 * Тело раскрытой карточки: строка типа с «Изменить» и состав конструкции.
 * Показом тела владеет панель аккордеона, поэтому состояния раскрытия здесь
 * нет — переключается только оно, шапка и подложка общие.
 */
export function ConstructionsNextBody(props: ConstructionsNextBodyProps) {
  const {entry, typeConfigs, climate, editingTarget, onEditingChange, onChange} = props;

  return (
    <CardBody>
      <ConstructionsNextHeaderRow
        entry={entry}
        typeConfigs={typeConfigs}
        climate={climate}
        editing={editingTarget === 'header'}
        onOpen={() => onEditingChange('header')}
        onCommit={fields => {
          onEditingChange(null);
          onChange(withHeaderFields(entry, fields), {commit: true});
        }}
        onCancel={() => onEditingChange(null)}
      />
      <ConstructionsNextContent {...props} />
    </CardBody>
  );
}
