import React from 'react';
import {Field} from '../primitives';
import {KeoNextFieldControl} from './keo-next-field-control';
import {KeoNextFieldNotes} from './keo-next-field-notes';
import {KeoRequiredMark} from './keo-required-mark';
import type {KeoFieldProps} from './keo-next.types';

/** Поле экрана: подпись, контрол по типу поля и подписи под ним. */
export function KeoNextField({control, room, field}: KeoFieldProps) {
  return (
    <Field
      label={
        <>
          {field.label}
          <KeoRequiredMark required={field.required} />
        </>
      }
    >
      <KeoNextFieldControl
        field={field}
        value={room.values[field.name]}
        onChange={value => control.changeValue(room.id, field.name, value)}
      />
      <KeoNextFieldNotes
        field={field}
        value={room.values[field.name]}
        source={control.sourceFor(room.id, field.name)}
        edited={control.isEdited(room.id, field.name)}
        warnings={control.warningsFor(room, field)}
      />
    </Field>
  );
}
