import React from 'react';
import type {ConditionsState} from './use-conditions.types';

/** Сводка условий в шапке. Раскрытая форма показывает те же значения полями, поэтому там её нет. */
export function ConditionsSummary({open, state}: {open: boolean; state: ConditionsState}) {
  if (open) {
    return null;
  }

  return (
    <span className="a2ui-t--sub a2ui-t--muted">
      {state.cityText} · климат по СП 131 · условия {state.condition}
    </span>
  );
}
