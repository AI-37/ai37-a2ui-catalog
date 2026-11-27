import React from 'react';
import {Button, PlusIcon} from '../primitives';
import type {KeoAddRoomProps} from './keo-next.types';

/**
 * «+ Добавить помещение». Стоит вне `Accordion.Root`: внутри него живут только
 * секции, иначе клавиатура пошла бы по чужим кнопкам.
 *
 * `maxRooms` из props гасит кнопку, пока предел освобождается удалением: она
 * вернётся в работу, а исчезновение перестраивало бы экран под руками. Когда
 * освобождать нечем (`hidden` — верхняя граница сошлась с нижней), кнопки нет
 * в разметке вовсе: невидимая глазом, но живая для клавиатуры и диктора — она
 * была бы худшим из вариантов (design next-add-item-limit, Решения 2 и 4).
 */
export function KeoNextAddRoom({label, state, onClick}: KeoAddRoomProps) {
  if (state === 'hidden') {
    return null;
  }

  return (
    <div style={{justifySelf: 'start'}}>
      <Button
        variant="outline"
        dashed
        icon={<PlusIcon />}
        disabled={state === 'disabled'}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}
