import React from 'react';
import {Card, CardBody} from '../primitives';
import {KeoNextConditions} from './keo-next-conditions';
import type {KeoConditionsSlotProps} from './keo-next.types';

/**
 * Условия без заголовка: `conditionsLabel` не пришёл, и раскрывашкой группа
 * стать не может — подписать её триггер нечем, а своего русского слова
 * компонент не сочиняет (Решение 4 design).
 *
 * Тогда условия стоят первым блоком, открытыми: их на экране одна-две строки,
 * и прятать их за безымянным шевроном хуже, чем показать.
 */
export function KeoNextConditionsSlot({control, conditions, label}: KeoConditionsSlotProps) {
  if (label !== undefined) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <KeoNextConditions control={control} conditions={conditions} />
      </CardBody>
    </Card>
  );
}
