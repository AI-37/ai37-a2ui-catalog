import React from 'react';

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
  if (!show) {
    return null;
  }

  return (
    <span className="a2ui-t--sub a2ui-t--muted">
      проходит {passing} из {comparable}
    </span>
  );
}
