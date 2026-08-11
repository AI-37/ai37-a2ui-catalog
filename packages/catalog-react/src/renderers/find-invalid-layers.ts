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
 * Физические границы РУЧНОГО ввода. Значения из справочника (λА/λБ) под
 * проверку не попадают намеренно: они нормативные по определению — гранит
 * 3,49, сталь 58 законны, и подсветить их значило бы спорить с прил. М.
 *
 * Нижняя граница λ важнее верхней: именно она ловит дефект прода — штукатурка
 * с λ 0,001 Вт/(м·°C) (в двадцать раз лучше аэрогеля) дала R 10,16 и зелёный
 * вердикт «соответствует». Верхняя ловит опечатку разрядом (700 вместо 0,7).
 */
export const LAMBDA_MANUAL_MIN = 0.02;
export const LAMBDA_MANUAL_MAX = 5;

/** Слой ограждения толще двух метров — опечатка разрядом (2500 вместо 250). */
export const THICKNESS_MAX_MM = 2000;

/** λ вне физического диапазона. Только ручной ввод — см. константы выше. */
export function isLambdaManualOutOfRange(value: number | undefined): boolean {
  if (typeof value !== 'number') return false;
  return value < LAMBDA_MANUAL_MIN || value > LAMBDA_MANUAL_MAX;
}

/** Толщина сверх физического максимума; отсутствие толщины — не этот случай. */
export function isThicknessOutOfRange(value: number | null): boolean {
  if (value === null) return false;
  return value > THICKNESS_MAX_MM;
}

/**
 * Ошибки данных конструкции — аналог пометки «(! проверить)» из текстового
 * вывода агента, но целиком на клиенте: подсветка гаснет сама, как только
 * причина устранена. Индикация, не блок — submit уходит как есть.
 * Строки-зазоры не проверяются: λ им не нужна, Rs считает сервер.
 *
 * Предикаты диапазонов живут здесь же и экспортируются наружу, чтобы строка
 * слоя подсвечивала ровно то, что считается невалидным: разъехавшиеся правила
 * валидации у клиента и у расчёта — уже пойманный дефект (P1-4).
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

  return (
    !hasLambda ||
    !hasThickness ||
    layer.material.trim() === '' ||
    isLambdaManualOutOfRange(layer.lambdaManual) ||
    isThicknessOutOfRange(layer.thicknessMm)
  );
}
