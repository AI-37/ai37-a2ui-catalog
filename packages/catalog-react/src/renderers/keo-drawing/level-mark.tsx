import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_INK} from './drawing-colors';

/** Отметка уровня ГОСТ: галочка остриём в точку и подчёркнутое «+0,000». */
export function LevelMark({x, y, label}: {x: number; y: number; label: string}) {
  const view = useDrawingView();
  const p = view.toScreen(x, y);

  return (
    <g>
      <polyline
        points={`${p.px - 7},${p.py - 7} ${p.px},${p.py} ${p.px + 7},${p.py - 7}`}
        strokeWidth={1}
        style={{fill: 'none', stroke: DRAWING_INK}}
      />
      <line
        x1={p.px - 7}
        y1={p.py - 7}
        x2={p.px + 46}
        y2={p.py - 7}
        strokeWidth={1}
        style={{stroke: DRAWING_INK}}
      />
      <DrawingText x={p.px + 42} y={p.py - 11} fill={DRAWING_INK} size={13} anchor="end">
        {label}
      </DrawingText>
    </g>
  );
}
