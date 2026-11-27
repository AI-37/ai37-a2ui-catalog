import React from 'react';
import type {CalcEditorField} from '@ai37/a2ui-catalog-schemas';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';

/**
 * Предупреждение о значении САМОГО поля («нет — открытый горизонт»): подпись
 * тоном предупреждения. Текст приходит от агента, клиент его не сочиняет.
 */
export function KeoNextValueWarning({field, value}: {field: CalcEditorField; value: string}) {
  const warning = field.valueWarnings?.[value];

  if (warning === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--warning">{renderLabelSubscripts(warning)}</span>;
}
