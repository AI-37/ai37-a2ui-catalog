import React from 'react';
import {DimTick} from './dim-tick';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_RED} from './drawing-colors';

/**
 * Вертикальная размерная линия: число повёрнуто вдоль линии. Концы — в
 * мировых метрах, линия смещена от `xObj` на экранные `offsetPx`
 * (положительное — вправо).
 */
export function DimV({
  y1,
  y2,
  xObj,
  offsetPx,
  label,
}: {
  y1: number;
  y2: number;
  xObj: number;
  offsetPx: number;
  label: string;
}) {
  const view = useDrawingView();
  // больший мировой y — меньший экранный py (верхний конец)
  const top = view.toScreen(xObj, Math.max(y1, y2));
  const bottom = view.toScreen(xObj, Math.min(y1, y2));
  const x = top.px + offsetPx;
  const over = offsetPx >= 0 ? 5 : -5;
  const cy = (top.py + bottom.py) / 2;
  const thin = {stroke: DRAWING_RED};

  return (
    <g>
      <line x1={top.px} y1={top.py} x2={x + over} y2={top.py} strokeWidth={0.7} style={thin} />
      <line
        x1={bottom.px}
        y1={bottom.py}
        x2={x + over}
        y2={bottom.py}
        strokeWidth={0.7}
        style={thin}
      />
      <line x1={x} y1={top.py - 3} x2={x} y2={bottom.py + 3} strokeWidth={0.9} style={thin} />
      <DimTick x={x} y={top.py} />
      <DimTick x={x} y={bottom.py} />
      <DrawingText
        x={x - 5}
        y={cy}
        fill={DRAWING_RED}
        size={14}
        anchor="middle"
        transform={`rotate(-90 ${x - 5} ${cy})`}
      >
        {label}
      </DrawingText>
    </g>
  );
}
