import React from 'react';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_INK} from './drawing-colors';

/**
 * Сечение конструкции: контур чернилами и диагональная штриховка 45°.
 * Прямоугольник задаётся в мировых метрах нижним левым углом.
 */
export function CutRect({x, y, w, h}: {x: number; y: number; w: number; h: number}) {
  const view = useDrawingView();
  // нижний левый угол мира — верхний левый угол экрана
  const p = view.toScreen(x, y + h);

  return (
    <rect
      x={p.px}
      y={p.py}
      width={w * view.pxPerMeter}
      height={h * view.pxPerMeter}
      strokeWidth={1.1}
      style={{fill: view.hatchFill, stroke: DRAWING_INK}}
    />
  );
}
