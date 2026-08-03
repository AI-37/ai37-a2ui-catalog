import type {ConstructionEntry, ConstructionTypeConfig} from '@ai37/a2ui-catalog-schemas';
import type {
  ConstructionErrors,
  ConstructionsValidation,
  LayerRowErrors,
} from './constructions-editor.types';

/**
 * Клиентская валидация перед submit (Решение 5 design.md): пустой материал,
 * толщина null/≤0, отсутствие ручной λ у строки без λ из справочника, пустое
 * паспортное Rпр у типа без слоёв. Строки-зазоры λ не требуют (их Rs считает
 * сервер). Серверная батч-валидация агента остаётся страховкой — здесь
 * мгновенная подсветка без раунд-трипа.
 */
export function validateConstructions(
  constructions: ConstructionEntry[],
  typeConfigs: ConstructionTypeConfig[],
): ConstructionsValidation {
  const byEntryId = new Map<string, ConstructionErrors>();

  for (const entry of constructions) {
    const config = typeConfigs.find(candidate => candidate.type === entry.type);
    const errors = validateEntry(entry, config);

    if (errors.rprPassport || errors.layers.size > 0) {
      byEntryId.set(entry.id, errors);
    }
  }

  return {valid: byEntryId.size === 0, byEntryId};
}

function validateEntry(
  entry: ConstructionEntry,
  config: ConstructionTypeConfig | undefined,
): ConstructionErrors {
  const layers = new Map<number, LayerRowErrors>();

  if (config && !config.hasLayers) {
    return {rprPassport: entry.rprPassport === undefined, layers};
  }

  entry.layers.forEach((layer, index) => {
    const isGap = layer.kind !== undefined && layer.kind !== 'material';
    const hasReferenceLambda =
      typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number';

    const rowErrors: LayerRowErrors = {
      material: layer.material.trim().length === 0,
      thickness: layer.thicknessMm === null || layer.thicknessMm <= 0,
      lambda: !isGap && !hasReferenceLambda && typeof layer.lambdaManual !== 'number',
    };

    if (rowErrors.material || rowErrors.thickness || rowErrors.lambda) {
      layers.set(index, rowErrors);
    }
  });

  return {rprPassport: false, layers};
}
