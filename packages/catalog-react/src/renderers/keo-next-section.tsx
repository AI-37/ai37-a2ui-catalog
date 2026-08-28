import React from 'react';
import {SectionItem} from '../primitives';
import {buildCalcSectionSummary} from './build-calc-section-summary';
import {calcTouchedKey} from './calc-touched-key';
import {KeoNextBadge} from './keo-next-badge';
import {KeoNextFields} from './keo-next-fields';
import type {KeoSectionProps} from './keo-next.types';

/**
 * Секция помещения — карточка-раскрывашка со сводкой и пометкой. Значение
 * элемента аккордеона — составной ключ «{id помещения}::{секция}»: секций
 * «Геометрия» на экране столько же, сколько помещений, и по одному
 * `section.key` они бы слиплись.
 */
export function KeoNextSection({control, room, section, panelId, computedLabel}: KeoSectionProps) {
  const key = calcTouchedKey(room.id, section.key);

  return (
    <SectionItem
      value={key}
      panelId={panelId}
      title={section.title}
      summary={buildCalcSectionSummary(section.fields, room.values)}
      badge={<KeoNextBadge tone={control.badgeFor(key)} />}
    >
      <KeoNextFields
        control={control}
        room={room}
        fields={section.fields}
        computedLabel={computedLabel}
      />
    </SectionItem>
  );
}
