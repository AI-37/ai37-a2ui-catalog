import React from 'react';
import {Form} from '../primitives';
import {isRevealedField} from './is-revealed-field';
import {KeoNextComputedNote} from './keo-next-computed-note';
import {KeoNextField} from './keo-next-field';
import type {KeoFieldsProps} from './keo-next.types';

/**
 * Содержимое раскрытой секции помещения: сетка полей и — в секции назначения —
 * вычисляемая строка плоскости и точки расчёта.
 *
 * Скрытые `revealBy` поля не рендерятся: ветка затенения появляется и исчезает
 * по полю-триггеру, а введённое в ней значение остаётся в документе.
 */
export function KeoNextFields({control, room, fields, computedLabel}: KeoFieldsProps) {
  return (
    <Form columns={2}>
      {fields
        .filter(field => isRevealedField(field, room.values))
        .map(field => (
          <KeoNextField key={field.name} control={control} room={room} field={field} />
        ))}
      <KeoNextComputedNote label={computedLabel} value={control.computedNoteFor(room)} />
    </Form>
  );
}
