import type {ConstructionLayerKind} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, type A2uiMessages} from '../i18n';

/** Виды слоя в порядке пунктов селектора. */
export const LAYER_KINDS: readonly ConstructionLayerKind[] = [
  'material',
  'vent-gap',
  'closed-gap',
  'thin',
];

/**
 * Подписи видов слоя — одни для селектора формы и для сводки строки
 * (change `constructions-layer-kind-thin`).
 */
export function layerKindLabels(
  messages: A2uiMessages = RU_MESSAGES,
): Record<ConstructionLayerKind, string> {
  const m = messages.constructions;

  return {
    material: m.kindMaterial,
    'vent-gap': m.kindVentGap,
    'closed-gap': m.kindClosedGap,
    thin: m.kindThin,
  };
}

export function layerKindItems(messages: A2uiMessages = RU_MESSAGES) {
  const labels = layerKindLabels(messages);

  return LAYER_KINDS.map(value => ({value, label: labels[value]}));
}
