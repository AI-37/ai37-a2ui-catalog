import React from 'react';
import {PROBA_DATA_CHIP_CSS} from './data-chip-css';
import type {DataChipProps} from './data-chip.types';

/**
 * Пилюля исходного значения: подпись приглушённым, значение начертанием.
 * Формой это `Chip` набора, поэтому пилюля собирается его классом — новые
 * здесь только две части и пунктир.
 */
export function DataChip({label, value, dashed}: DataChipProps) {
  return (
    <>
      <style href="proba-data-chip" precedence="default">
        {PROBA_DATA_CHIP_CSS}
      </style>
      <span
        className={`a2ui-chip a2ui-chip--data a2ui-t--sub${dashed ? ' a2ui-chip--dashed' : ''}`}
      >
        <span className="a2ui-chip__label">{label}</span>
        <span className="a2ui-chip__value">{value}</span>
      </span>
    </>
  );
}
