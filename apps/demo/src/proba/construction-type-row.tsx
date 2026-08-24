import React from 'react';
import {Button} from '@ai37/a2ui-catalog-react/primitives';

/** Строка типа конструкции над слоями. У конструкций без типа не рендерится. */
export function ConstructionTypeRow({type}: {type: string | undefined}) {
  if (!type) {
    return null;
  }

  return (
    <div style={rowStyle}>
      <span className="a2ui-t--sub">{type}</span>
      <Button size="sm">Изменить</Button>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};
