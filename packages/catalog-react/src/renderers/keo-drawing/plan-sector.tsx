import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_BLUE, DRAWING_RED} from './drawing-colors';

/**
 * Сектор света на плане: из расчётной точки между азимутами краёв проёма
 * (ψ₁, ψ₂ от оси характерного разреза) через проём и дальше сквозь стену
 * наружу. Подпись — число лучей n₂.
 */
export function PlanSector({
  poleY,
  psi1Deg,
  psi2Deg,
  wallThickness,
  label,
}: {
  poleY: number;
  psi1Deg: number;
  psi2Deg: number;
  wallThickness: number;
  label?: string | undefined;
}) {
  const view = useDrawingView();
  const at = (psiDeg: number, depth: number) =>
    view.toScreen(Math.tan((psiDeg * Math.PI) / 180) * depth, poleY - depth);
  const points = [
    view.toScreen(0, poleY),
    at(psi1Deg, poleY),
    at(psi1Deg, poleY + wallThickness),
    at(psi2Deg, poleY + wallThickness),
    at(psi2Deg, poleY),
  ];
  const mid = view.toScreen(0, poleY * 0.45);

  return (
    <g>
      <polygon
        points={points.map(p => `${p.px},${p.py}`).join(' ')}
        strokeWidth={0.9}
        style={{fill: DRAWING_BLUE, fillOpacity: 0.25, stroke: DRAWING_BLUE}}
      />
      {label !== undefined && (
        <DrawingText x={mid.px + 26} y={mid.py} fill={DRAWING_RED} size={15} anchor="start">
          {label}
        </DrawingText>
      )}
    </g>
  );
}
