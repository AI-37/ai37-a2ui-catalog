import React from 'react';
import {Card} from './proposed-card';
import {CardBody} from './proposed-card-body';
import {ConstructionTypeRow} from './construction-type-row';
import {PlusIcon} from './proba-icons';
import {ProposedButton} from './proposed-button';
import type {ConstructionEntry} from './construction-card.types';

/** Тело карточки конструкции: тип, слои, «Слой». Свёрнутая карточка тела не рендерит. */
export function ConstructionBody({entry, open}: {entry: ConstructionEntry; open: boolean}) {
  if (!open) {
    return null;
  }

  return (
    <CardBody>
      <ConstructionTypeRow type={entry.type} />

      {entry.layers?.map(layer => (
        <Card key={layer.title} tone="plain">
          <div style={layerRowStyle}>
            <span className="a2ui-t--body">{layer.title}</span>
            <span className="a2ui-t--sub a2ui-t--muted">{layer.meta}</span>
          </div>
        </Card>
      ))}

      <div style={{justifySelf: 'start'}}>
        <ProposedButton dashed size="sm" icon={<PlusIcon />}>
          Слой
        </ProposedButton>
      </div>
    </CardBody>
  );
}

const layerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 12px',
};
