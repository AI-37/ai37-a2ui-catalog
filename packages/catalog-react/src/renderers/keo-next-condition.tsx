import React from 'react';
import {Field} from '../primitives';
import {KeoNextConditionControl} from './keo-next-condition-control';
import {KeoNextSourceNote} from './keo-next-source-note';
import type {KeoConditionProps} from './keo-next.types';

/**
 * Строка условий: подпись, контрол по типу условия и одна подпись под ним —
 * откуда значение («из проекта · изменить только для расчёта»).
 *
 * `note` условия сюда не идёт: он говорит не про источник, а про СЛЕДСТВИЕ
 * значения (группа светового климата, C_N), и стоит сводкой в шапке группы —
 * там его видно и у свёрнутой секции.
 */
export function KeoNextCondition({control, condition}: KeoConditionProps) {
  return (
    <Field label={condition.label}>
      <KeoNextConditionControl
        condition={condition}
        value={control.conditionValue(condition.name)}
        onChange={value => control.changeCondition(condition.name, value)}
      />
      <KeoNextSourceNote
        source={condition.source}
        edited={control.isConditionEdited(condition.name)}
        hint={undefined}
      />
    </Field>
  );
}
