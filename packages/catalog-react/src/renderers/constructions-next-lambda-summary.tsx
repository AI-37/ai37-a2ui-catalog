import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';
import {resolveLayerLambda} from './resolve-layer-lambda';
import {useA2uiMessages} from '../i18n';

/**
 * λ в строке-сводке слоя, пятью ветками: тонкий слой (Rs = 0), зазор (Rs
 * считает сервер), ручная λ, λ из справочника с пометкой «авто» и пустая λ
 * предупреждающим цветом. Каждая ветка — свой `return`, а не тернарник в
 * разметке строки.
 */
export function ConstructionsNextLambdaSummary({
  layer,
  condition,
}: {
  layer: ConstructionLayer;
  condition: OperatingCondition;
}) {
  const m = useA2uiMessages().constructions;

  if (layer.kind === 'thin') {
    return <span className="a2ui-t--muted">{m.lambdaNotCounted}</span>;
  }

  if (layer.kind !== undefined && layer.kind !== 'material') {
    return <span className="a2ui-t--muted">{m.gapInFinal}</span>;
  }

  if (typeof layer.lambdaManual === 'number') {
    return <span>λ {layer.lambdaManual}</span>;
  }

  if (typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number') {
    return (
      <span>
        λ {resolveLayerLambda(layer, condition)}
        <span className="a2ui-t--muted">{` ${m.lambdaAuto}`}</span>
      </span>
    );
  }

  return <span className="a2ui-t--warning">{m.lambdaMissing}</span>;
}
