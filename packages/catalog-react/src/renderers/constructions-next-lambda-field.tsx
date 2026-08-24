import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import {NumberField, Static} from '../primitives';
import type {OperatingCondition} from './constructions-editor.types';
import {resolveLayerLambda} from './resolve-layer-lambda';

/**
 * Поле λ в форме слоя тремя ветками: у зазора λ не бывает (Rs считает сервер),
 * у материала из справочника она приходит с опцией и показана значением с
 * пометкой «авто», у своего материала — вводится вручную.
 */
export function ConstructionsNextLambdaField({
  layer,
  condition,
  onChange,
}: {
  layer: ConstructionLayer;
  condition: OperatingCondition;
  onChange: (lambdaManual: number | undefined) => void;
}) {
  if (layer.kind !== undefined && layer.kind !== 'material') {
    return <Static>Rs — в итоговом расчёте</Static>;
  }

  if (typeof layer.lambdaA === 'number' || typeof layer.lambdaB === 'number') {
    return (
      <Static>
        {resolveLayerLambda(layer, condition)}
        <span className="a2ui-t--sub a2ui-t--muted"> авто</span>
      </Static>
    );
  }

  return (
    <NumberField
      value={layer.lambdaManual ?? null}
      min={0.001}
      step={0.001}
      compact
      onValueChange={value => onChange(value ?? undefined)}
    />
  );
}
