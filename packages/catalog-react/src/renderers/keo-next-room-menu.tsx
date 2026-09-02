import React from 'react';
import {Menu, MoreIcon} from '../primitives';
import type {KeoRoomMenuProps} from './keo-next.types';

/**
 * Действия помещения. Удаление живёт пунктом меню, а не голым «✕»:
 * необратимое действие не должно попадаться под палец так же легко, как
 * раскрытие (Решение 5 design). Последнее помещение не удаляется — документ
 * без помещений не расчёт, а пустой бланк.
 *
 * Подпись пункта одна на все помещения, поэтому доступное имя триггера несёт
 * ещё и название: иначе диктор читает подряд несколько одинаковых кнопок.
 */
export function KeoNextRoomMenu({removable, label, title, onRemove}: KeoRoomMenuProps) {
  if (!removable) {
    return null;
  }

  return (
    <Menu
      icon={<MoreIcon />}
      ariaLabel={`Действия: ${title}`}
      items={[{label, tone: 'danger', onSelect: onRemove}]}
    />
  );
}
