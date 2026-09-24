import React from 'react';
import {Card} from '../primitives';
import {ConstructionsNextLayerNumbers} from './constructions-next-layer-numbers';
import {LAYER_KIND_LABELS} from './layer-kind-labels';
import type {ConstructionsNextLayerProps} from './constructions-next.types';

/**
 * Сводка слоя: вся строка — кликабельная карточка (значит кнопка, значит
 * клавиатура и роль даром). Материал — основной текст, числа прижаты вправо;
 * незаполненный материал назван словами и предупреждающим цветом. Вид слоя,
 * если это не материал, стоит приглушённой подписью под названием — так
 * зазор и тонкий слой видны без раскрытия формы.
 */
export function ConstructionsNextLayerSummary({
  layer,
  condition,
  onOpen,
}: ConstructionsNextLayerProps) {
  const materialMissing = layer.material.trim() === '';
  const kindLabel =
    layer.kind === undefined || layer.kind === 'material' ? undefined : LAYER_KIND_LABELS[layer.kind];

  return (
    <Card tone="plain" onClick={onOpen}>
      <div style={rowStyle}>
        <span style={materialStyle}>
          <span className={`a2ui-t--body${materialMissing ? ' a2ui-t--warning' : ''}`}>
            {materialMissing ? 'материал не указан' : layer.material}
          </span>
          {kindLabel === undefined ? null : (
            <span className="a2ui-t--sub a2ui-t--muted">{kindLabel.toLowerCase()}</span>
          )}
        </span>
        <ConstructionsNextLayerNumbers layer={layer} condition={condition} />
      </div>
    </Card>
  );
}

const materialStyle: React.CSSProperties = {
  display: 'grid',
  gap: 2,
  minWidth: 0,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '8px 12px',
};
