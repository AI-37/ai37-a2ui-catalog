import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
} from '@ai37/a2ui-catalog-schemas';

/** Производная невалидность конструкции; считается на каждый рендер, как live-Rпр. */
export type ConstructionInvalidity = {
  /** Индексы материальных слоёв без λ, положительной толщины или материала. */
  layerIndexes: number[];
  /** Тип без слоёв, а паспортное Rпр не введено. */
  missingPassport: boolean;
  /** Есть хоть одна причина подсветить карточку. */
  invalid: boolean;
};

/**
 * Ошибки данных конструкции — аналог пометки «(! проверить)» из текстового
 * вывода агента, но целиком на клиенте: подсветка гаснет сама, как только
 * причина устранена. Индикация, не блок — submit уходит как есть.
 * Строки-зазоры не проверяются: λ им не нужна, Rs считает сервер.
 */
export function findInvalidLayers(
  entry: ConstructionEntry,
  config: ConstructionTypeConfig | undefined,
): ConstructionInvalidity {
  // Нет конфига типа — судим по слоям: это дефолтный путь и для hasLayers.
  if (config && !config.hasLayers) {
    const missingPassport = entry.rprPassport === undefined;
    return {layerIndexes: [], missingPassport, invalid: missingPassport};
  }

  const layerIndexes = entry.layers.flatMap((layer, index) =>
    isInvalidMaterialLayer(layer) ? [index] : [],
  );
  return {layerIndexes, missingPassport: false, invalid: layerIndexes.length > 0};
}

function isInvalidMaterialLayer(layer: ConstructionLayer): boolean {
  if (layer.kind !== undefined && layer.kind !== 'material') {
    return false;
  }

  const hasLambda =
    typeof layer.lambdaA === 'number' ||
    typeof layer.lambdaB === 'number' ||
    typeof layer.lambdaManual === 'number';
  const hasThickness = layer.thicknessMm !== null && layer.thicknessMm > 0;

  return !hasLambda || !hasThickness || layer.material.trim() === '';
}
