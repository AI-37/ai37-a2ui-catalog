import type {ConstructionType, ConstructionTypeConfig} from '@ai37/a2ui-catalog-schemas';
import {SUBTYPED_TYPE} from './subtyped-construction-type';
import type {ConstructionHeaderFields} from './constructions-editor.types';

/**
 * Черновик формы шапки после смены типа. Поля, которые живут только у своего
 * типа, уходят вместе с ним: разновидность — у перекрытий, коэффициент
 * однородности r — у слоистых (у изделия Rпр паспортное, множителя нет).
 * Температуры помещения (tв*, tот*) остаются: поправка nt по (5.3)
 * накладывается на базовое Rтр таблицы 3 у любого типа, включая изделия.
 */
export function nextHeaderDraftForType(
  draft: ConstructionHeaderFields,
  nextType: ConstructionType,
  typeConfigs: ConstructionTypeConfig[],
): ConstructionHeaderFields {
  const hasLayers = typeConfigs.find(config => config.type === nextType)?.hasLayers ?? false;
  return {
    ...draft,
    type: nextType,
    subtype: nextType === SUBTYPED_TYPE ? draft.subtype : undefined,
    r: hasLayers ? draft.r : undefined,
  };
}
