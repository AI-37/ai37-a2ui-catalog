import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_RED} from './drawing-colors';

/**
 * Визирный луч из расчётной точки под углом возвышения (α — верх проёма,
 * β — верх застройки): штриховая линия к окну и подпись курсивом у места, где
 * луч уходит за верхнюю кромку листа.
 */
export function SightRay({
  x,
  y,
  angleDeg,
  label,
}: {
  x: number;
  y: number;
  angleDeg: number;
  label: string;
}) {
  const view = useDrawingView();
  const p = view.toScreen(x, y);
  const angle = (angleDeg * Math.PI) / 180;
  // длины с запасом хватает до любого края — SVG обрежет сам
  const len = view.width + view.height;
  // подпись — там, где луч поднялся на 64 px от верхней кромки, но не левее её
  const rawX = p.px - (p.py - 64) / Math.tan(angle);
  const labelX = Math.max(24, rawX);
  const labelY = p.py + Math.tan(angle) * (labelX - p.px) + 18;

  return (
    <g>
      <line
        x1={p.px}
        y1={p.py}
        x2={p.px - Math.cos(angle) * len}
        y2={p.py - Math.sin(angle) * len}
        strokeWidth={0.9}
        strokeDasharray="8 5"
        style={{stroke: DRAWING_RED}}
      />
      <DrawingText x={labelX} y={labelY} fill={DRAWING_RED} size={12} anchor="start">
        {label}
      </DrawingText>
    </g>
  );
}
