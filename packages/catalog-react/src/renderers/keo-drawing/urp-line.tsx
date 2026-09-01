import React from 'react';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_BLUE} from './drawing-colors';

/**
 * Линия условной рабочей поверхности: горизонталь на высоте расчётной точки
 * от дальней стены до плоскости светопроёма.
 */
export function UrpLine({y, x1, x2}: {y: number; x1: number; x2: number}) {
  const view = useDrawingView();
  const a = view.toScreen(x1, y);
  const b = view.toScreen(x2, y);

  return (
    <line x1={a.px} y1={a.py} x2={b.px} y2={b.py} strokeWidth={1.1} style={{stroke: DRAWING_BLUE}} />
  );
}
