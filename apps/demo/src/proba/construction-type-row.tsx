import React from 'react';
import {ProposedButton} from './proposed-button';

/** Строка типа конструкции над слоями. У конструкций без типа не рендерится. */
export function ConstructionTypeRow({type}: {type: string | undefined}) {
  if (!type) {
    return null;
  }

  return (
    <div style={rowStyle}>
      <span className="a2ui-t--sub">{type}</span>
      <ProposedButton size="sm">Изменить</ProposedButton>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};
