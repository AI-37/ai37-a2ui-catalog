import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';
import {ConstructionsNextLambdaSummary} from './constructions-next-lambda-summary';

/**
 * Правая колонка строки слоя: толщина и λ. Незаполненная толщина названа
 * словами и предупреждающим цветом — это пометка «проверить», а не ошибка.
 */
export function ConstructionsNextLayerNumbers({
  layer,
  condition,
}: {
  layer: ConstructionLayer;
  condition: OperatingCondition;
}) {
  const thicknessMissing = layer.thicknessMm === null || layer.thicknessMm <= 0;

  return (
    <span className="a2ui-t--sub a2ui-t--muted" style={numbersStyle}>
      <span className={thicknessMissing ? 'a2ui-t--warning' : undefined}>
        {thicknessMissing ? 'толщина не задана' : `${layer.thicknessMm} мм`}
      </span>
      <span aria-hidden="true">·</span>
      <ConstructionsNextLambdaSummary layer={layer} condition={condition} />
    </span>
  );
}

const numbersStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: 6,
  whiteSpace: 'nowrap',
};
