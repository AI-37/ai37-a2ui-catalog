import React from 'react';

/** Замечание к ступени шкалы. У ступеней без замечания не рендерится. */
export function TypeStepNote({note}: {note: string | undefined}) {
  if (!note) {
    return null;
  }

  return <span style={noteStyle}>{note}</span>;
}

const noteStyle: React.CSSProperties = {
  justifySelf: 'start',
  padding: '2px 8px',
  borderRadius: 6,
  background: '#fef3c7',
  color: '#92400e',
  fontSize: 11.5,
};
