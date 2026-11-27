import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import type {OperatingCondition} from './constructions-editor.types';
import {ConstructionsNextLambdaSummary} from './constructions-next-lambda-summary';
import {layerNeedsThickness} from './layer-needs-thickness';
import {formatMessage, useA2uiMessages} from '../i18n';

/**
 * Правая колонка строки слоя: толщина и λ. Незаполненная толщина названа
 * словами и предупреждающим цветом — это пометка «проверить», а не ошибка.
 * У вентилируемого зазора и тонкого слоя толщина не нужна — без неё строка
 * печатает приглушённое «без толщины», а не предупреждение.
 */
export function ConstructionsNextLayerNumbers({
  layer,
  condition,
}: {
  layer: ConstructionLayer;
  condition: OperatingCondition;
}) {
  const m = useA2uiMessages().constructions;
  const thicknessMissing = layer.thicknessMm === null || layer.thicknessMm <= 0;
  const thicknessOptional = !layerNeedsThickness(layer);

  return (
    <span className="a2ui-t--sub a2ui-t--muted" style={numbersStyle}>
      <span className={thicknessMissing && !thicknessOptional ? 'a2ui-t--warning' : undefined}>
        {thicknessMissing
          ? thicknessOptional
            ? m.noThickness
            : m.thicknessMissing
          : formatMessage(m.thicknessValue, {value: String(layer.thicknessMm)})}
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
