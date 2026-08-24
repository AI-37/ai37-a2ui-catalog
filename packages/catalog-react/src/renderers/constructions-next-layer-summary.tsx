import React from 'react';
import {Card} from '../primitives';
import {ConstructionsNextLayerNumbers} from './constructions-next-layer-numbers';
import type {ConstructionsNextLayerProps} from './constructions-next.types';

/**
 * Сводка слоя: вся строка — кликабельная карточка (значит кнопка, значит
 * клавиатура и роль даром). Материал — основной текст, числа прижаты вправо;
 * незаполненный материал назван словами и предупреждающим цветом.
 */
export function ConstructionsNextLayerSummary({
  layer,
  condition,
  onOpen,
}: ConstructionsNextLayerProps) {
  const materialMissing = layer.material.trim() === '';

  return (
    <Card tone="plain" onClick={onOpen}>
      <div style={rowStyle}>
        <span className={`a2ui-t--body${materialMissing ? ' a2ui-t--warning' : ''}`}>
          {materialMissing ? 'материал не указан' : layer.material}
        </span>
        <ConstructionsNextLayerNumbers layer={layer} condition={condition} />
      </div>
    </Card>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 12px',
};
