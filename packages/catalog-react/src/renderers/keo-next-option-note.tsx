import React from 'react';
import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';

/** Пояснение к выбранному варианту списка: текст от агента, не от клиента. */
export function KeoNextOptionNote({field, value}: {field: CalcEditorField; value: string}) {
  const note = field.optionNotes?.[value];

  if (note === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{renderLabelSubscripts(note)}</span>;
}
