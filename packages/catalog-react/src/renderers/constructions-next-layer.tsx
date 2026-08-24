import React from 'react';
import {ConstructionsNextLayerForm} from './constructions-next-layer-form';
import {ConstructionsNextLayerSummary} from './constructions-next-layer-summary';
import type {ConstructionsNextLayerProps} from './constructions-next.types';

/**
 * Строка слоя в двух видах: компактная сводка, раскрывающаяся кликом, и форма
 * с явным коммитом. Разводка по виду — здесь, чтобы ни сводка, ни форма не
 * знали про существование второго вида.
 */
export function ConstructionsNextLayer(props: ConstructionsNextLayerProps) {
  if (props.mode === 'summary') {
    return <ConstructionsNextLayerSummary {...props} />;
  }

  return <ConstructionsNextLayerForm {...props} />;
}
