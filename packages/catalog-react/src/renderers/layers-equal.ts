import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';

// Все поля схемы слоя: новое поле обязано попасть сюда, иначе «Применить»
// с правкой только этого поля молча не пошлёт черновик.
const LAYER_FIELDS = [
  'material',
  'thicknessMm',
  'kind',
  'materialKey',
  'lambdaA',
  'lambdaB',
  'lambdaManual',
] as const satisfies ReadonlyArray<keyof ConstructionLayer>;

/**
 * Побайтовое (по полям схемы) сравнение слоёв: «Применить» без изменений
 * не должно порождать черновик — форма закрывается через onCancel.
 */
export function layersEqual(a: ConstructionLayer, b: ConstructionLayer): boolean {
  return LAYER_FIELDS.every(field => a[field] === b[field]);
}
