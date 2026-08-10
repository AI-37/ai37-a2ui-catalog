import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';

/**
 * λ строки для live-Rпр: `lambdaManual`, иначе λА при условии эксплуатации
 * «А», иначе λБ. Дефолт «нет condition → λБ (с запасом)» ОБЯЗАН совпадать с
 * серверным `resolve-layer-lambda` агента teplo-calc — расхождение live-цифры
 * с канонической подрывает доверие (синхронизировано общей тест-фикстурой).
 * `undefined` — λ не определена: слагаемое строки в live-сумме пропускается.
 */
export function resolveLayerLambda(
  layer: ConstructionLayer,
  condition: OperatingCondition,
): number | undefined {
  if (typeof layer.lambdaManual === 'number') {
    return layer.lambdaManual;
  }

  if (condition === 'А' && typeof layer.lambdaA === 'number') {
    return layer.lambdaA;
  }

  return layer.lambdaB;
}
