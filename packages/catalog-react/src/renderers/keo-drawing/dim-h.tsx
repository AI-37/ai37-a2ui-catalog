import React from 'react';
import {DimTick} from './dim-tick';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_RED} from './drawing-colors';

/**
 * Горизонтальная размерная линия ГОСТ: выноски от объекта, засечки 45°, число
 * в мм курсивом над серединой. Концы — в мировых метрах, сама линия смещена
 * от уровня `yObj` на экранные `offsetPx` (положительное — вниз).
 */
export function DimH({
  x1,
  x2,
  yObj,
  offsetPx,
  label,
}: {
  x1: number;
  x2: number;
  yObj: number;
  offsetPx: number;
  label: string;
}) {
  const view = useDrawingView();
  const a = view.toScreen(Math.min(x1, x2), yObj);
  const b = view.toScreen(Math.max(x1, x2), yObj);
  const y = a.py + offsetPx;
  // выноска слегка перехлёстывает размерную линию — в сторону смещения
  const over = offsetPx >= 0 ? 5 : -5;
  const thin = {stroke: DRAWING_RED};

  return (
    <g>
      <line x1={a.px} y1={a.py} x2={a.px} y2={y + over} strokeWidth={0.7} style={thin} />
      <line x1={b.px} y1={b.py} x2={b.px} y2={y + over} strokeWidth={0.7} style={thin} />
      <line x1={a.px - 3} y1={y} x2={b.px + 3} y2={y} strokeWidth={0.9} style={thin} />
      <DimTick x={a.px} y={y} />
      <DimTick x={b.px} y={y} />
      <DrawingText x={(a.px + b.px) / 2} y={y - 5} fill={DRAWING_RED} size={14} anchor="middle">
        {label}
      </DrawingText>
    </g>
  );
}
