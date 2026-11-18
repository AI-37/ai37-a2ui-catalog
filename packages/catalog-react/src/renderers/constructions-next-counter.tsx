import React from 'react';
import {formatMessage, useA2uiMessages} from '../i18n';

/**
 * Счётчик «проходит N из M». Молчит, пока климат тронут: присланный Rнорм
 * протух, и сравнивать с ним до следующих props нечего.
 */
export function ConstructionsNextCounter({
  show,
  passing,
  comparable,
}: {
  show: boolean;
  passing: number;
  comparable: number;
}) {
  const m = useA2uiMessages();
  if (!show) {
    return null;
  }

  return (
    <span className="a2ui-t--sub a2ui-t--muted">
      {formatMessage(m.constructions.passing, {passing, total: comparable})}
    </span>
  );
}
