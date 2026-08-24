import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';
import {resolveLayerLambda} from './resolve-layer-lambda';

/**
 * λ в строке-сводке слоя, четырьмя ветками: зазор (Rs считает сервер), ручная
 * λ, λ из справочника с пометкой «авто» и пустая λ предупреждающим цветом.
 * Каждая ветка — свой `return`, а не тернарник в разметке строки.
 */
export function ConstructionsNextLambdaSummary({
  layer,
  condition,
}: {
  layer: ConstructionLayer;
  condition: OperatingCondition;
}) {
  if (layer.kind !== undefined && layer.kind !== 'material') {
    return <span className="a2ui-t--muted">Rs — в итоговом расчёте</span>;
  }

  if (typeof layer.lambdaManual === 'number') {
    return <span>λ {layer.lambdaManual}</span>;
  }

  if (typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number') {
    return (
      <span>
        λ {resolveLayerLambda(layer, condition)}
        <span className="a2ui-t--muted"> авто</span>
      </span>
    );
  }

  return <span className="a2ui-t--warning">λ не задана</span>;
}
