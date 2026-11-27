import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_BLUE, DRAWING_RED} from './drawing-colors';

/**
 * Видимый участок неба: треугольник от расчётной точки до плоскости
 * остекления между углами возвышения `fromDeg` и `toDeg`. Подпись — число
 * лучей n₁.
 */
export function SkySector({
  poleX,
  poleY,
  fromDeg,
  toDeg,
  glassX,
  label,
}: {
  poleX: number;
  poleY: number;
  fromDeg: number;
  toDeg: number;
  glassX: number;
  label?: string | undefined;
}) {
  const view = useDrawingView();
  const p = view.toScreen(poleX, poleY);
  const dPx = Math.abs(glassX - poleX) * view.pxPerMeter;
  const gx = p.px - dPx;
  const tan = (deg: number) => Math.tan((deg * Math.PI) / 180);
  const yLow = p.py - tan(fromDeg) * dPx;
  const yHigh = p.py - tan(toDeg) * dPx;

  return (
    <g>
      <polygon
        points={`${p.px},${p.py} ${gx},${yLow} ${gx},${yHigh}`}
        strokeWidth={0.8}
        style={{fill: DRAWING_BLUE, fillOpacity: 0.25, stroke: DRAWING_BLUE}}
      />
      {label !== undefined && (
        <DrawingText
          x={p.px - dPx * 0.62}
          y={p.py - tan((fromDeg + toDeg) / 2) * dPx * 0.62 + 5}
          fill={DRAWING_RED}
          size={15}
          anchor="middle"
        >
          {label}
        </DrawingText>
      )}
    </g>
  );
}
