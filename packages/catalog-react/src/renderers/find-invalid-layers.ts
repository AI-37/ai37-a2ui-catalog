import type {
  ConstructionEntry,
  ConstructionLayer,
  ConstructionTypeConfig,
} from '@ai37/a2ui-catalog-schemas';
import {isSubtypeRequired} from './is-subtype-required';

/** Производная невалидность конструкции; считается на каждый рендер, как live-Rпр. */
export type ConstructionInvalidity = {
  /** Индексы материальных слоёв без λ, положительной толщины или материала. */
  layerIndexes: number[];
  /** Тип без слоёв, а паспортное Rпр не введено. */
  missingPassport: boolean;
  /** Тип, которому разновидность обязательна, а она не выбрана. */
  missingSubtype: boolean;
  /** Есть хоть одна причина подсветить карточку. */
  invalid: boolean;
  /**
   * Число проблемных слоёв, когда ВСЕ проблемы карточки — отсутствие λ
   * (материал и толщина на месте): чип может назвать счёт «N слоёв без λ».
   * Смешанные проблемы, паспорт или разновидность — null, текст чипа общий
   * «проверить».
   */
  missingLambdaCount: number | null;
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
  // Без разновидности расчёт невозможен: αн разнится втрое, и агент возвращает
  // «выберите подтип перекрытия» вместо отчёта.
  const missingSubtype = isSubtypeRequired(config) && entry.subtype === undefined;

  // Нет конфига типа — судим по слоям: это дефолтный путь и для hasLayers.
  if (config && !config.hasLayers) {
    const missingPassport = entry.rprPassport === undefined;
    return {
      layerIndexes: [],
      missingPassport,
      missingSubtype,
      invalid: missingPassport || missingSubtype,
      missingLambdaCount: null,
    };
  }

  const layerIndexes: number[] = [];
  let lambdaOnly = true;
  entry.layers.forEach((layer, index) => {
    if (!isInvalidMaterialLayer(layer)) return;
    layerIndexes.push(index);
    if (!isMissingLambdaOnly(layer)) lambdaOnly = false;
  });
  // Счёт «N слоёв без λ» назвал бы не ту причину: при незаполненной
  // разновидности слои могут быть заполнены полностью.
  const lambdaCountable = layerIndexes.length > 0 && lambdaOnly && !missingSubtype;
  return {
    layerIndexes,
    missingPassport: false,
    missingSubtype,
    invalid: layerIndexes.length > 0 || missingSubtype,
    missingLambdaCount: lambdaCountable ? layerIndexes.length : null,
  };
}

function isInvalidMaterialLayer(layer: ConstructionLayer): boolean {
  if (layer.kind !== undefined && layer.kind !== 'material') {
    return false;
  }

  return !hasLambda(layer) || !hasThickness(layer) || layer.material.trim() === '';
}

/** Единственный дефект слоя — отсутствие λ: остальное заполнено. */
function isMissingLambdaOnly(layer: ConstructionLayer): boolean {
  return !hasLambda(layer) && hasThickness(layer) && layer.material.trim() !== '';
}

function hasLambda(layer: ConstructionLayer): boolean {
  return (
    typeof layer.lambdaA === 'number' ||
    typeof layer.lambdaB === 'number' ||
    typeof layer.lambdaManual === 'number'
  );
}

function hasThickness(layer: ConstructionLayer): boolean {
  return layer.thicknessMm !== null && layer.thicknessMm > 0;
}
