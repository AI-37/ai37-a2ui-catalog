import React from 'react';
import {DRAWING_RED} from './drawing-colors';

/** Засечка 45° размерной линии (экранные px). */
export function DimTick({x, y}: {x: number; y: number}) {
  return (
    <line
      x1={x - 4}
      y1={y + 4}
      x2={x + 4}
      y2={y - 4}
      strokeWidth={1.2}
      style={{stroke: DRAWING_RED}}
    />
  );
}
