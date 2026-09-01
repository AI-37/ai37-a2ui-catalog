import {PLAN_SIDE_WALL} from './sheet-constants';
import type {KeoPlanDrawing} from '@ai37/a2ui-catalog-schemas';
import type {DrawingBounds} from './drawing-view.types';

/**
 * Границы листа плана: помещение плюс поля под размерные линии. Ось Y —
 * характерный разрез (вглубь помещения), начало — на внутренней грани
 * оконной стены, ось X — вдоль стены через расчётную точку.
 */
export function planBounds(plan: KeoPlanDrawing): DrawingBounds {
  const half = plan.roomWidth / 2 + PLAN_SIDE_WALL + 1.2;

  return {
    xMin: -half,
    xMax: half,
    yMin: -(plan.wallThickness + 1.1),
    yMax: plan.roomDepth + PLAN_SIDE_WALL + 0.7,
  };
}
