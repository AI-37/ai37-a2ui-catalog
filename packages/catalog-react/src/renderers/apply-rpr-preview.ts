import type {ConstructionEntry} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsEditorFormTarget} from './constructions-editor.types';
import type {ConstructionsNextPreview} from './constructions-next.types';

/**
 * Конструкция, какой её видит чип Rпр, пока открыта форма: подменённый слой
 * (правка), добавленный в конец (новый) или чужое `rprPassport`. Всё
 * остальное — статус, невалидность, сводки — считается от закоммиченного
 * `entry`, поэтому подмена живёт отдельной функцией и наружу не уходит.
 */
export function applyRprPreview(
  entry: ConstructionEntry,
  target: ConstructionsEditorFormTarget | null,
  preview: ConstructionsNextPreview | null,
): ConstructionEntry {
  if (preview === null) {
    return entry;
  }

  if (preview.kind === 'passport') {
    return {...entry, rprPassport: preview.value};
  }

  if (target === 'new') {
    return {...entry, layers: [...entry.layers, preview.layer]};
  }

  if (typeof target === 'number') {
    return {
      ...entry,
      layers: entry.layers.map((layer, index) => (index === target ? preview.layer : layer)),
    };
  }

  return entry;
}
