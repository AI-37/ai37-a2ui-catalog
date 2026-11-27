import {FAR_WALL_THICKNESS, SECTION_LEFT_MARGIN, SLAB_THICKNESS} from './sheet-constants';
import type {KeoSectionDrawing} from '@ai37/a2ui-catalog-schemas';
import type {DrawingBounds} from './drawing-view.types';

/**
 * Границы листа разреза по габаритам модели: помещение плюс поля под
 * размерные линии слева и снизу и под визирные лучи сверху. Начало
 * координат — пересечение уровня пола с внутренней гранью оконной стены.
 */
export function sectionBounds(section: KeoSectionDrawing): DrawingBounds {
  return {
    xMin: -(section.wallThickness + SECTION_LEFT_MARGIN),
    xMax: section.roomDepth + FAR_WALL_THICKNESS + 0.7,
    yMin: -(SLAB_THICKNESS + 0.78),
    yMax: section.roomHeight + 1.8,
  };
}
