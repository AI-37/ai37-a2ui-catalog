import React from 'react';

/** Сводка условий в заголовке. Раскрытая форма показывает те же значения полями, поэтому там её нет. */
export function ConditionsSummary({open}: {open: boolean}) {
  if (open) {
    return null;
  }

  return (
    <span className="a2ui-t--sub a2ui-t--muted">Москва · климат по СП 131 · условия Б</span>
  );
}
