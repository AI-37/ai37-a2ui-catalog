import React from 'react';
import {renderLabelSubscripts} from './render-label-subscripts';
import type {DataChipProps} from './data-chip.types';

/**
 * Пилюля исходного значения: подпись приглушённым, значение начертанием.
 * Формой это `Chip` набора, поэтому пилюля собирается его классом — новые
 * здесь только две части и пунктир.
 *
 * Подпись приходит от агента плоской нотацией (`ρ_ф`, `e_н`) и идёт через
 * `renderLabelSubscripts`; значение — числа и текст без индексов, его не
 * трогаем.
 */
export function DataChip({label, value, dashed}: DataChipProps) {
  return (
    <span className={`a2ui-chip a2ui-chip--data a2ui-t--sub${dashed ? ' a2ui-chip--dashed' : ''}`}>
      <span className="a2ui-chip__label">{renderLabelSubscripts(label)}</span>
      <span className="a2ui-chip__value">{value}</span>
    </span>
  );
}
