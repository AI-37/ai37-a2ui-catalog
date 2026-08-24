import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/** Что вернул выбор: проверка, что наружу уходит вся опция, а не только подпись. */
export function PickedNote({picked}: {picked: LookupOption | null}) {
  if (!picked) {
    return null;
  }

  return (
    <pre style={preStyle}>{JSON.stringify(picked, null, 2)}</pre>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: 12,
  borderRadius: 10,
  background: '#f8fafc',
  fontSize: 12,
  overflowX: 'auto',
};
