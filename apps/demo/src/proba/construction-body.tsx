import React from 'react';
import {Button, Card, CardBody, PlusIcon} from '@ai37/a2ui-catalog-react/primitives';
import {ConstructionTypeRow} from './construction-type-row';
import type {ConstructionEntry} from './construction-card.types';

/**
 * Тело карточки конструкции: тип, слои, «Слой». Показом тела владеет панель
 * аккордеона, поэтому состояния раскрытия здесь нет.
 */
export function ConstructionBody({entry}: {entry: ConstructionEntry}) {
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
        <Button variant="link" tone="accent" size="sm" icon={<PlusIcon />}>
          Слой
        </Button>
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
