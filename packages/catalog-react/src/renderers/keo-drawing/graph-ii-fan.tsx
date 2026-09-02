import React from 'react';
import {DrawingText} from './drawing-text';
import {FanNumbers} from './fan-numbers';
import {GRAPH_CIRCLE_INDICES} from './graph-i-rays';
import {useDrawingView} from './use-drawing-view';
import {
  DRAWING_FAN_MAJOR,
  DRAWING_FAN_MINOR,
  DRAWING_FAN_NUM,
  DRAWING_FAN_RAY,
} from './drawing-colors';

/**
 * Веер графика Данилюка II на плане: лучи из расчётной точки к окну (ось
 * веера — характерный разрез) и полуокружности той же цены деления, что у
 * графика I на разрезе — номер полуокружности и есть связка графиков через C₁.
 *
 * Азимуты лучей приходят пропсом: закон K(ψ; θ) = k зависит от θ и живёт у
 * агента (Решение 2 design.md). Приезжает половина веера, k = 1…49; вторую
 * рендерер отражает — веер симметричен относительно оси разреза.
 */
export function GraphIiFan({
  poleY,
  rayAnglesDeg,
  radius50,
}: {
  /** Расчётная точка на оси разреза: (0, poleY), м. */
  poleY: number;
  /** Азимуты лучей одной половины веера, град. */
  rayAnglesDeg: number[];
  /** Радиус полуокружности № 50, м. */
  radius50: number;
}) {
  const view = useDrawingView();
  const p = view.toScreen(0, poleY);
  const r50 = radius50 * view.pxPerMeter;
  const innerR = (5 / 50) * r50;

  // полуокружности нижней полуплоскости — со стороны окна
  const circles = GRAPH_CIRCLE_INDICES.map(index => {
    const major = index % 5 === 0;
    const r = (index / 50) * r50;
    return (
      <path
        key={`c${index}`}
        d={`M ${p.px - r} ${p.py} A ${r} ${r} 0 0 0 ${p.px + r} ${p.py}`}
        strokeWidth={major ? 0.9 : 0.55}
        style={{fill: 'none', stroke: major ? DRAWING_FAN_MAJOR : DRAWING_FAN_MINOR}}
      />
    );
  });

  const rays: React.ReactElement[] = [];
  const sides: Array<-1 | 1> = [-1, 1];

  for (const side of sides) {
    for (const [index, psiDeg] of rayAnglesDeg.entries()) {
      const k = index + 1;
      const major = k % 5 === 0;
      const psi = ((psiDeg * side) * Math.PI) / 180;
      // ось веера смотрит к окну: dx = sin ψ (экран вправо), dy = cos ψ (вниз)
      const dx = Math.sin(psi);
      const dy = Math.cos(psi);
      const from = major ? 0 : innerR;
      rays.push(
        <line
          key={`r${k}s${side}`}
          x1={p.px + dx * from}
          y1={p.py + dy * from}
          x2={p.px + dx * r50}
          y2={p.py + dy * r50}
          strokeWidth={major ? 0.9 : 0.55}
          style={{stroke: major ? DRAWING_FAN_MAJOR : DRAWING_FAN_RAY}}
        />,
      );
      if (k % 10 === 0) {
        rays.push(
          <DrawingText
            key={`t${k}s${side}`}
            x={p.px + dx * r50 * 0.56}
            y={p.py + dy * r50 * 0.56}
            fill={DRAWING_FAN_NUM}
            size={12}
            anchor="middle"
          >
            {String(k)}
          </DrawingText>,
        );
      }
    }
  }

  return (
    <g>
      <g opacity={0.85}>
        {circles}
        {rays}
      </g>
      {/* нижняя линия графика: на ней лежат концы полуокружностей */}
      <line
        x1={p.px - r50}
        y1={p.py}
        x2={p.px + r50}
        y2={p.py}
        strokeWidth={1.1}
        style={{stroke: DRAWING_FAN_MAJOR}}
      />
      <FanNumbers px={p.px} py={p.py} r50={r50} sheetWidth={view.width} offsetY={17} />
    </g>
  );
}
