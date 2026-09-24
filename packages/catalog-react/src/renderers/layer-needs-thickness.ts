import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';

/**
 * Нужна ли строке толщина: у материала — для δ/λ, у замкнутого зазора — для
 * Rs по табл. Г.1. Вентилируемый зазор отбрасывается вместе с наружными
 * слоями, тонкий слой даёт Rs = 0 — их `thicknessMm: null` не пометка
 * «проверить», а норма (change `constructions-layer-kind-thin`). Зеркало
 * серверного `layerNeedsThickness` агента теплотехники.
 */
export function layerNeedsThickness(layer: ConstructionLayer): boolean {
  return layer.kind !== 'vent-gap' && layer.kind !== 'thin';
}
