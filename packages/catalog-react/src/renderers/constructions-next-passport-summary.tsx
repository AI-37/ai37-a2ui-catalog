import React from 'react';
import {Button} from '../primitives';
import type {ConstructionsNextPassportProps} from './constructions-next.types';
import {useA2uiMessages} from '../i18n';

/**
 * «Rпр по паспорту» в режиме чтения. Незаданное значение названо словами и
 * предупреждающим цветом — как незаполненные поля строки-сводки слоя.
 */
export function ConstructionsNextPassportSummary({value, onOpen}: ConstructionsNextPassportProps) {
  const m = useA2uiMessages();
  const missing = value === undefined;

  return (
    <div style={rowStyle}>
      <span className="a2ui-t--sub a2ui-t--muted">{m.constructions.passport}</span>
      <span className={`a2ui-t--body${missing ? ' a2ui-t--warning' : ''}`}>
        {missing ? m.common.notSet : value.toFixed(2)}
      </span>
      <Button size="sm" aria-label={m.constructions.editPassport} onClick={onOpen}>
        {m.common.edit}
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
