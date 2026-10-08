import type {ConstructionLayerKind} from '@ai37/a2ui-catalog-schemas';

/**
 * Подписи видов слоя — одни для селектора формы и для сводки строки
 * (change `constructions-layer-kind-thin`). Порядок — порядок пунктов селектора.
 */
export const LAYER_KIND_LABELS: Record<ConstructionLayerKind, string> = {
  material: 'Материал',
  'vent-gap': 'Вентилируемый зазор',
  'closed-gap': 'Замкнутый зазор',
  thin: 'Тонкий слой',
};

export const LAYER_KIND_ITEMS = (
  Object.entries(LAYER_KIND_LABELS) as Array<[ConstructionLayerKind, string]>
).map(([value, label]) => ({value, label}));
