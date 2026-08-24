import React from 'react';
import type {ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {Button, Field, Form, Input, Select} from '../primitives';
import {ConstructionsNextSubtypeField} from './constructions-next-subtype-field';
import {SUBTYPED_TYPE} from './subtyped-construction-type';
import type {ConstructionHeaderFields} from './constructions-editor.types';
import type {ConstructionsNextHeaderRowProps} from './constructions-next.types';
import {headerFieldsEqual} from './header-fields-equal';

/**
 * Форма шапки: тип, разновидность и название. Правки живут в локальной копии и
 * уходят наверх только по «Сохранить» — до него заголовок карточки, live-Rпр и
 * состояние редактора прежние. «Сохранить» без изменений равносилен «Отмене».
 */
export function ConstructionsNextHeaderForm({
  entry,
  typeConfigs,
  onCommit,
  onCancel,
}: ConstructionsNextHeaderRowProps) {
  const [draft, setDraft] = React.useState<ConstructionHeaderFields>({
    type: entry.type,
    subtype: entry.subtype,
    name: entry.name,
  });

  const handleSave = () => {
    if (headerFieldsEqual(draft, entry)) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  return (
    <div style={formStyle}>
      <Form columns={2}>
        <Field label="Тип конструкции">
          <Select
            items={typeConfigs.map(config => ({value: config.type, label: config.label}))}
            value={draft.type}
            onValueChange={next => {
              const nextType = (next ?? draft.type) as ConstructionType;
              setDraft({
                ...draft,
                type: nextType,
                // Разновидность живёт только у своего типа: сменили тип —
                // чужая разновидность уходит вместе с ним.
                subtype: nextType === SUBTYPED_TYPE ? draft.subtype : undefined,
              });
            }}
          />
        </Field>
        <ConstructionsNextSubtypeField
          type={draft.type}
          value={draft.subtype}
          onChange={subtype => setDraft({...draft, subtype})}
        />
        <Field label="Название">
          <Input
            value={draft.name ?? ''}
            onChange={event => setDraft({...draft, name: event.target.value})}
          />
        </Field>
      </Form>

      <div style={actionsStyle}>
        <Button variant="filled" size="sm" onClick={handleSave}>
          Сохранить
        </Button>
        <Button size="sm" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}

const formStyle: React.CSSProperties = {display: 'grid', gap: 12};

const actionsStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
