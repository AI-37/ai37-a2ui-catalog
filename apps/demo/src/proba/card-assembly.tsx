import React from 'react';
import {ConditionsGroup} from './conditions-group';
import {ConstructionsGroup} from './constructions-group';
import {Button, Card, KitStyles} from '@ai37/a2ui-catalog-react/primitives';

/** Экран `ConstructionsEditor`, собранный из готовых примитивов. Чего нет на экране — нет и здесь. */
export function CardAssembly() {
  return (
    <section className="a2ui-kit" style={frameStyle}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <ConditionsGroup />
          <ConstructionsGroup />

          <div style={footerStyle}>
            <Button variant="filled" size="lg">
              Далее
            </Button>
            <span className="a2ui-t--sub a2ui-t--muted">проходит 2 из 4</span>
          </div>
        </div>
      </Card>
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
