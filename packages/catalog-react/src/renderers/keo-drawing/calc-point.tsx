import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_RED} from './drawing-colors';

/** Расчётная точка: точка и курсивная подпись «А (РТ)» слева-сверху от неё. */
export function CalcPoint({x, y, label = 'А (РТ)'}: {x: number; y: number; label?: string}) {
  const view = useDrawingView();
  const p = view.toScreen(x, y);

  return (
    <g>
      <circle cx={p.px} cy={p.py} r={3.6} style={{fill: DRAWING_RED}} />
      <DrawingText x={p.px - 10} y={p.py - 8} fill={DRAWING_RED} size={13} anchor="end">
        {label}
      </DrawingText>
    </g>
  );
}
