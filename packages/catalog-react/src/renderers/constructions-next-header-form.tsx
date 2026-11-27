import React from 'react';
import type {ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {Button, Field, Form, Input, Select} from '../primitives';
import {ConstructionsNextRField} from './constructions-next-r-field';
import {ConstructionsNextRoomTempField} from './constructions-next-room-temp-field';
import {ConstructionsNextSubtypeField} from './constructions-next-subtype-field';
import {nextHeaderDraftForType} from './next-header-draft-for-type';
import type {ConstructionHeaderFields} from './constructions-editor.types';
import type {ConstructionsNextHeaderRowProps} from './constructions-next.types';
import {headerFieldsEqual} from './header-fields-equal';
import {useA2uiMessages} from '../i18n';

/**
 * Форма шапки: тип, разновидность, название, коэффициент однородности r и
 * температуры помещения (tв*, tот*) — поправка nt по (5.3). Правки живут в
 * локальной копии и уходят наверх только по «Сохранить» — до него заголовок
 * карточки, чипы и состояние редактора прежние. «Сохранить» без изменений
 * равносилен «Отмене».
 */
export function ConstructionsNextHeaderForm({
  entry,
  typeConfigs,
  climate,
  onCommit,
  onCancel,
}: ConstructionsNextHeaderRowProps) {
  const m = useA2uiMessages();
  const [draft, setDraft] = React.useState<ConstructionHeaderFields>({
    type: entry.type,
    subtype: entry.subtype,
    name: entry.name,
    r: entry.r,
    tvRoom: entry.tvRoom,
    totRoom: entry.totRoom,
  });
  const hasLayers = typeConfigs.find(config => config.type === draft.type)?.hasLayers ?? false;

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
        <Field label={m.constructions.type}>
          <Select
            items={typeConfigs.map(config => ({value: config.type, label: config.label}))}
            value={draft.type}
            onValueChange={next => {
              const nextType = (next ?? draft.type) as ConstructionType;
              setDraft(nextHeaderDraftForType(draft, nextType, typeConfigs));
            }}
          />
        </Field>
        <ConstructionsNextSubtypeField
          type={draft.type}
          value={draft.subtype}
          onChange={subtype => setDraft({...draft, subtype})}
        />
        <Field label={m.constructions.name}>
          <Input
            value={draft.name ?? ''}
            onChange={event => setDraft({...draft, name: event.target.value})}
          />
        </Field>
        <ConstructionsNextRField
          show={hasLayers}
          value={draft.r}
          onChange={r => setDraft({...draft, r})}
        />
        <ConstructionsNextRoomTempField
          label={
            <>
              t<sub className="a2ui-field__index">в</sub>* — {m.constructions.roomTemp}
            </>
          }
          value={draft.tvRoom}
          fallback={climate.tv}
          onChange={tvRoom => setDraft({...draft, tvRoom})}
        />
        <ConstructionsNextRoomTempField
          label={
            <>
              t<sub className="a2ui-field__index">от</sub>* — {m.constructions.coldSideTemp}
            </>
          }
          value={draft.totRoom}
          fallback={climate.tot}
          onChange={totRoom => setDraft({...draft, totRoom})}
        />
      </Form>

      <div style={actionsStyle}>
        <Button variant="filled" size="sm" onClick={handleSave}>
          {m.common.save}
        </Button>
        <Button size="sm" onClick={onCancel}>
          {m.common.cancel}
        </Button>
      </div>
    </div>
  );
}

const formStyle: React.CSSProperties = {display: 'grid', gap: 12};

const actionsStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
