import type {ConstructionLayerKind, LookupOption} from '@ai37/a2ui-catalog-schemas';
import {LAYER_KIND_LABELS} from './layer-kind-labels';

const SPECIAL_KINDS = (Object.keys(LAYER_KIND_LABELS) as ConstructionLayerKind[]).filter(
  kind => kind !== 'material',
);

/**
 * Вид слоя из опции справочника материалов: агент кладёт в справочник
 * спец-записи зазоров и тонкого слоя со `value`, равным виду (`vent-gap`,
 * `closed-gap`, `thin`). Раньше вид ставил только агент после submit, и до его
 * ответа строка считалась материалом без λ — подсвечивалась как невалидная.
 * Строка прил. М (`m…`) → `undefined`: вид остаётся материалом.
 */
export function layerKindFromOption(option: LookupOption): ConstructionLayerKind | undefined {
  return SPECIAL_KINDS.find(kind => kind === option.value);
}
