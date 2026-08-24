import React from 'react';
import {Button} from '../primitives';
import {ConstructionsNextBack} from './constructions-next-back';
import type {ConstructionsNextFooterProps} from './constructions-next.types';

/**
 * Футер экрана: возврат (если он есть), главная кнопка и счётчик. Клиентской
 * блокировки нет — единственный компетентный валидатор состава агент, а
 * счётчик рядом с кнопкой говорит, сколько конструкций проходит по норме.
 */
export function ConstructionsNextFooter({
  backLabel,
  onBack,
  submitLabel,
  onSubmit,
  counter,
}: ConstructionsNextFooterProps) {
  return (
    <div style={footerStyle}>
      <ConstructionsNextBack label={backLabel} onBack={onBack} />
      <Button variant="filled" size="lg" onClick={onSubmit}>
        {submitLabel}
      </Button>
      {counter}
    </div>
  );
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
