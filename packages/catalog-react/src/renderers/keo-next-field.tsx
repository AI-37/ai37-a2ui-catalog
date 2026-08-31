import React from 'react';
import {Field} from '../primitives';
import {KeoNextFieldControl} from './keo-next-field-control';
import {KeoNextFieldNotes} from './keo-next-field-notes';
import {KeoRequiredMark} from './keo-required-mark';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {KeoFieldProps} from './keo-next.types';

/**
 * Поле экрана: подпись, контрол по типу поля и подписи под ним.
 *
 * Подпись собирается JSX'ом — к ней прирастает пометка обязательного, —
 * поэтому строку через `renderLabelSubscripts` прогоняет рендерер: до строки
 * внутри фрагмента примитив `Field` не достаёт.
 */
export function KeoNextField({control, room, field}: KeoFieldProps) {
  return (
    <Field
      label={
        <>
          {renderLabelSubscripts(field.label)}
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
