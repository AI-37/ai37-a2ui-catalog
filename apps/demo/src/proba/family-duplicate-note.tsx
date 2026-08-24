import React from 'react';

/** Пометка дублирования. У семейств без дубля не рендерится. */
export function FamilyDuplicateNote({duplicateOf}: {duplicateOf: string | undefined}) {
  if (!duplicateOf) {
    return null;
  }

  return <p style={noteStyle}>дубль: {duplicateOf}</p>;
}

const noteStyle: React.CSSProperties = {
  margin: 0,
  padding: '4px 8px',
  borderRadius: 6,
  background: '#fef3c7',
  color: '#92400e',
  fontSize: 12.5,
  justifySelf: 'start',
};
