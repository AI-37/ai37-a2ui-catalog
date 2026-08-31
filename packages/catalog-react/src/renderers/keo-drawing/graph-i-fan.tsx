import React from 'react';
import {FanNumbers} from './fan-numbers';
import {graphIRays, GRAPH_CIRCLE_INDICES} from './graph-i-rays';
import {useDrawingView} from './use-drawing-view';
import {
  DRAWING_FAN_MAJOR,
  DRAWING_FAN_MINOR,
  DRAWING_FAN_RAY,
} from './drawing-colors';

/**
 * Веер графика Данилюка I как напечатанная подложка листа: полуокружности
 * (каждая пятая темнее) и лучи над линией УРП полюсом в расчётной точке.
 * Полуокружности — дугами, а не отсечением: `clipPath` теряется при
 * растеризации, а лучи ниже полюса и так не опускаются.
 *
 * Жирные лучи (каждый пятый) идут от полюса, тонкие начинаются с
 * полуокружности № 5 — у полюса тонкой паутины на бумаге нет.
 */
export function GraphIFan({
  poleX,
  poleY,
  radius50,
}: {
  poleX: number;
  poleY: number;
  /** Радиус полуокружности № 50, м. */
  radius50: number;
}) {
  const view = useDrawingView();
  const p = view.toScreen(poleX, poleY);
  const r50 = radius50 * view.pxPerMeter;
  const innerR = (5 / 50) * r50;

  const circles = GRAPH_CIRCLE_INDICES.map(index => {
    const major = index % 5 === 0;
    const r = (index / 50) * r50;
    return (
      <path
        key={`c${index}`}
        d={`M ${p.px - r} ${p.py} A ${r} ${r} 0 0 1 ${p.px + r} ${p.py}`}
        strokeWidth={major ? 0.9 : 0.55}
        style={{fill: 'none', stroke: major ? DRAWING_FAN_MAJOR : DRAWING_FAN_MINOR}}
      />
    );
  });

  const rays = graphIRays().map(ray => {
    const major = ray.k % 5 === 0;
    const dx = Math.sin(ray.angleFromZenith) * ray.side;
    const dy = Math.cos(ray.angleFromZenith);
    const from = major ? 0 : innerR;
    return (
      <line
        key={`r${ray.k}s${ray.side}`}
        x1={p.px + dx * from}
        y1={p.py - dy * from}
        x2={p.px + dx * r50}
        y2={p.py - dy * r50}
        strokeWidth={major ? 0.9 : 0.55}
        style={{stroke: major ? DRAWING_FAN_MAJOR : DRAWING_FAN_RAY}}
      />
    );
  });

  return (
    <g>
      <g opacity={0.85}>
        {circles}
        {rays}
        {/* центральная линия графика — жирный луч через зенит */}
        <line
          x1={p.px}
          y1={p.py}
          x2={p.px}
          y2={p.py - r50}
          strokeWidth={0.9}
          style={{stroke: DRAWING_FAN_MAJOR}}
        />
      </g>
      <FanNumbers px={p.px} py={p.py} r50={r50} sheetWidth={view.width} offsetY={16} />
    </g>
  );
}
