import React from 'react';
import type {ChipProps} from './chip.types';

/** Пилюля с числом: `Rпр 4.09 ≥ 3.19`. */
export function Chip({tone = 'neutral', children}: ChipProps) {
  return (
    <span className={`a2ui-chip a2ui-chip--${tone} a2ui-t--sub a2ui-t--strong`}>{children}</span>
  );
}
