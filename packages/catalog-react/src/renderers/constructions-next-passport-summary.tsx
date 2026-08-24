import React from 'react';
import {Button} from '../primitives';
import type {ConstructionsNextPassportProps} from './constructions-next.types';

/**
 * «Rпр по паспорту» в режиме чтения. Незаданное значение названо словами и
 * предупреждающим цветом — как незаполненные поля строки-сводки слоя.
 */
export function ConstructionsNextPassportSummary({value, onOpen}: ConstructionsNextPassportProps) {
  const missing = value === undefined;

  return (
    <div style={rowStyle}>
      <span className="a2ui-t--sub a2ui-t--muted">Rпр по паспорту:</span>
      <span className={`a2ui-t--body${missing ? ' a2ui-t--warning' : ''}`}>
        {missing ? 'не задано' : value.toFixed(2)}
      </span>
      <Button size="sm" aria-label="Изменить Rпр по паспорту" onClick={onOpen}>
        Изменить
      </Button>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
};
