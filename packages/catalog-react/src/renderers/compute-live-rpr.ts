import type {ConstructionEntry, ConstructionTypeConfig} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';
import {resolveLayerLambda} from './resolve-layer-lambda';

/**
 * Live-превью приведённого сопротивления теплопередаче:
 * `Rпр = 1/αв + 1/αн + Σ (thicknessMm/1000)/λ`. Канонический расчёт — на
 * сервере; здесь мгновенная обратная связь по мере правок. Спец-кейсы:
 *
 * - `alphaN`-record без записи для subtype (пол по грунту) — член `1/αн`
 *   опускается именно как спец-кейс, а не «нет значения → деление на 0»;
 * - строки-зазоры (`kind` ≠ material) пропускаются — их Rs считает сервер;
 * - незаполненные строки (нет толщины или λ) в сумму не входят;
 * - типы без слоёв: Rпр = введённое паспортное значение, `null` пока пусто.
 *
 * `null` — Rпр не определено (нет конфига типа или паспортного значения).
 */
export function computeLiveRpr(
  entry: ConstructionEntry,
  config: ConstructionTypeConfig | undefined,
  condition: OperatingCondition,
): number | null {
  if (!config) {
    return null;
  }

  if (!config.hasLayers) {
    return entry.rprPassport ?? null;
  }

  let total = 0;

  if (typeof config.alphaV === 'number') {
    total += 1 / config.alphaV;
  }

  const alphaN = resolveAlphaN(config, entry);
  if (typeof alphaN === 'number') {
    total += 1 / alphaN;
  }

  for (const layer of entry.layers) {
    if (layer.kind !== undefined && layer.kind !== 'material') {
      continue;
    }

    if (layer.thicknessMm === null || layer.thicknessMm <= 0) {
      continue;
    }

    const lambda = resolveLayerLambda(layer, condition);
    if (typeof lambda !== 'number' || lambda <= 0) {
      continue;
    }

    total += layer.thicknessMm / 1000 / lambda;
  }

  return total;
}

function resolveAlphaN(
  config: ConstructionTypeConfig,
  entry: ConstructionEntry,
): number | undefined {
  if (typeof config.alphaN === 'number') {
    return config.alphaN;
  }

  if (config.alphaN === undefined || entry.subtype === undefined) {
    return undefined;
  }

  return config.alphaN[entry.subtype];
}
