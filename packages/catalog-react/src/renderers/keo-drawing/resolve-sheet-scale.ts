import {MAX_PX_PER_METER, MIN_PX_PER_METER, TARGET_SHEET_WIDTH} from './sheet-constants';
import type {DrawingBounds} from './drawing-view.types';

/**
 * Цена деления, общая для обеих проекций: считается по самому широкому листу,
 * чтобы разрез и план стояли в одном масштабе — рядом два разных выглядели бы
 * как два разных помещения. Пикселей в модели нет, это правило рендерера
 * (Решение 4 design.md).
 */
export function resolveSheetScale(bounds: DrawingBounds[]): number {
  const widestSpan = Math.max(...bounds.map(item => item.xMax - item.xMin));

  return Math.min(MAX_PX_PER_METER, Math.max(MIN_PX_PER_METER, TARGET_SHEET_WIDTH / widestSpan));
}
