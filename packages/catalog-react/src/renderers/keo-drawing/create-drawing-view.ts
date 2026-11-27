import type {DrawingBounds, DrawingView} from './drawing-view.types';

/**
 * Вид листа по границам мира и цене деления. Y экрана растёт вниз, поэтому
 * ось переворачивается.
 */
export function createDrawingView(
  bounds: DrawingBounds,
  pxPerMeter: number,
  hatchId: string,
): DrawingView {
  return {
    pxPerMeter,
    width: (bounds.xMax - bounds.xMin) * pxPerMeter,
    height: (bounds.yMax - bounds.yMin) * pxPerMeter,
    toScreen: (x: number, y: number) => ({
      px: (x - bounds.xMin) * pxPerMeter,
      py: (bounds.yMax - y) * pxPerMeter,
    }),
    hatchFill: `url(#${hatchId})`,
  };
}
