import React from 'react';
import {Field as BaseField} from '@base-ui/react/field';
import {renderLabelSubscripts} from './render-label-subscripts';
import type {FieldProps} from './form.types';

/**
 * Поле формы: подпись над контролом. Связку подписи с контролом ставит
 * `Field` из Base UI — `htmlFor`/`id` он проставляет сам, в том числе тем
 * контролам, которые не `<input>` (`Select.Trigger`, `NumberField.Input`).
 *
 * Строковая подпись приходит от агента плоской нотацией (`d_п`) и проходит
 * через `renderLabelSubscripts`. JSX-подпись идёт мимо: рендерер уже свёрстал
 * её сам, с `<sub>`.
 */
export function Field({label, wide, children}: FieldProps) {
  return (
    <BaseField.Root className={`a2ui-field${wide ? ' a2ui-field--wide' : ''}`}>
      <BaseField.Label className="a2ui-field__label a2ui-t--sub a2ui-t--strong">
        {typeof label === 'string' ? renderLabelSubscripts(label) : label}
      </BaseField.Label>
      {children}
    </BaseField.Root>
  );
}
