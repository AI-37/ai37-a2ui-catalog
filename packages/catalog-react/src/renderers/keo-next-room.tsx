import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {calcTouchedKey} from './calc-touched-key';
import {SectionItem} from '../primitives';
import {buildKeoRoomSummary} from './build-keo-room-summary';
import {KeoNextBadge} from './keo-next-badge';
import {KeoNextRoomMenu} from './keo-next-room-menu';
import {KeoNextSection} from './keo-next-section';
import {keoTargetRoom} from './keo-target-room';
import type {KeoRoomProps} from './keo-next.types';

/**
 * Помещение — такая же секция-раскрывашка, а не вкладка (Решение 2 design):
 * второе помещение видно строкой со своей сводкой, а не спрятано за
 * переключателем, и счётчик футера, считающий весь документ, перестаёт
 * расходиться с тем, что на экране.
 *
 * Внутри — свой `Accordion` с `multiple: true`: сравнивать геометрию помещения
 * с размерами окна приходится глазами, а не по памяти.
 */
export function KeoNextRoom({
  control,
  room,
  title,
  removable,
  removeLabel,
  panelId,
  computedLabel,
  purposeSection,
}: KeoRoomProps) {
  return (
    <SectionItem
      value={room.id}
      panelId={panelId(room.id)}
      title={title}
      summary={buildKeoRoomSummary(control.sections, room.values)}
      badge={<KeoNextBadge tone={control.badgeFor(room.id)} />}
      action={
        <KeoNextRoomMenu
          removable={removable}
          label={removeLabel}
          title={title}
          onRemove={() => control.removeRoom(room.id)}
        />
      }
    >
      <Accordion.Root
        multiple
        value={[...control.open].filter(key => keoTargetRoom(key) === room.id)}
        onValueChange={(next: string[]) => control.setOpen(next, {roomId: room.id})}
        style={stackStyle}
      >
        {control.sections.map(section => (
          <KeoNextSection
            key={section.key}
            control={control}
            room={room}
            section={section}
            panelId={panelId(calcTouchedKey(room.id, section.key))}
            computedLabel={section.key === purposeSection ? computedLabel : undefined}
          />
        ))}
      </Accordion.Root>
    </SectionItem>
  );
}

const stackStyle: React.CSSProperties = {display: 'grid', gap: 8};
