import React from 'react';
import {SectionItem} from '../primitives';
import {buildKeoConditionsSummary} from './build-keo-conditions-summary';
import {KEO_CONDITIONS_KEY} from './keo-conditions-key';
import {KeoNextBadge} from './keo-next-badge';
import {KeoNextConditions} from './keo-next-conditions';
import type {KeoConditionsSectionProps} from './keo-next.types';

/**
 * Условия раскрывашкой — вариант с `conditionsLabel`: заголовок группы задаёт
 * агент, и он же делает её секцией наравне с помещениями.
 *
 * Стоит элементом внешнего `Accordion`, поэтому и рендерится только оттуда:
 * `Accordion.Item` вне своего корня не работает.
 */
export function KeoNextConditionsSection({
  control,
  conditions,
  label,
  panelId,
}: KeoConditionsSectionProps) {
  if (label === undefined) {
    return null;
  }

  return (
    <SectionItem
      value={KEO_CONDITIONS_KEY}
      panelId={panelId}
      title={label}
      summary={buildKeoConditionsSummary(conditions, control)}
      badge={<KeoNextBadge tone={control.badgeFor(KEO_CONDITIONS_KEY)} />}
      sectionRef={control.bindSection(KEO_CONDITIONS_KEY)}
    >
      <KeoNextConditions control={control} conditions={conditions} />
    </SectionItem>
  );
}
