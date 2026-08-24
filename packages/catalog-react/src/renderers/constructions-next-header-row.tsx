import React from 'react';
import {ConstructionsNextHeaderForm} from './constructions-next-header-form';
import {ConstructionsNextHeaderSummary} from './constructions-next-header-summary';
import type {ConstructionsNextHeaderRowProps} from './constructions-next.types';

/**
 * Строка типа и названия конструкции: чтение или форма — тем же паттерном, что
 * у слоя. Разводка здесь, чтобы ни одна из веток не знала про вторую.
 */
export function ConstructionsNextHeaderRow(props: ConstructionsNextHeaderRowProps) {
  if (!props.editing) {
    return <ConstructionsNextHeaderSummary {...props} />;
  }

  return <ConstructionsNextHeaderForm {...props} />;
}
