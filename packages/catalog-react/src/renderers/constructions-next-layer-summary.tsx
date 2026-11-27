import React from 'react';
import {Card} from '../primitives';
import {ConstructionsNextLayerNumbers} from './constructions-next-layer-numbers';
import {layerKindLabels} from './layer-kind-labels';
import type {ConstructionsNextLayerProps} from './constructions-next.types';
import {useA2uiI18n} from '../i18n';

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
  const {locale, messages} = useA2uiI18n();
  const materialMissing = layer.material.trim() === '';
  const kindLabel =
    layer.kind === undefined || layer.kind === 'material'
      ? undefined
      : layerKindLabels(messages)[layer.kind];

  return (
    <Card tone="plain" onClick={onOpen}>
      <div style={rowStyle}>
        <span style={materialStyle}>
          <span className={`a2ui-t--body${materialMissing ? ' a2ui-t--warning' : ''}`}>
            {materialMissing ? messages.constructions.materialMissing : layer.material}
          </span>
          {kindLabel === undefined ? null : (
            <span className="a2ui-t--sub a2ui-t--muted">{lowerFirst(kindLabel, locale)}</span>
          )}
        </span>
        <ConstructionsNextLayerNumbers layer={layer} condition={condition} />
      </div>
    </Card>
  );
}

/**
 * Вид слоя под названием — со строчной: «вентилируемый зазор». Опускается
 * только первая буква, иначе немецкое существительное потеряло бы заглавную.
 */
function lowerFirst(text: string, locale: string): string {
  return text.charAt(0).toLocaleLowerCase(locale) + text.slice(1);
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
