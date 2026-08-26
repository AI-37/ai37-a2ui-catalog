import React from 'react';
import {Button, PlusIcon} from '../primitives';
import type {KeoAddRoomProps} from './keo-next.types';

/**
 * «+ Добавить помещение». Стоит вне `Accordion.Root`: внутри него живут только
 * секции, иначе клавиатура пошла бы по чужим кнопкам. `maxRooms` из props
 * отключает кнопку, а не прячет — иначе предел выглядел бы поломкой.
 */
export function KeoNextAddRoom({label, disabled, onClick}: KeoAddRoomProps) {
  return (
    <div style={{justifySelf: 'start'}}>
      <Button variant="outline" dashed icon={<PlusIcon />} disabled={disabled} onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}
