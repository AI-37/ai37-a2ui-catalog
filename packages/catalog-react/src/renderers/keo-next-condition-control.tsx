import React from 'react';
import {Input, Lookup, Select, Static} from '../primitives';
import type {KeoConditionControlProps} from './keo-next.types';

/**
 * Контрол строки условий. Без `type` условие остаётся значением: норматив e_н
 * и методику выводит агент, править их незачем — коробка контрола звала бы это
 * делать.
 *
 * С `type` условие правится на месте. Город строительства — `lookup`, а не
 * свободный ввод: опечатка в городе меняет группу светового климата, то есть
 * весь расчёт (так же устроен город в `ConstructionsEditor`).
 */
export function KeoNextConditionControl({
  condition,
  value,
  onChange,
}: KeoConditionControlProps) {
  if (condition.type === 'lookup') {
    return (
      <Lookup
        name={condition.name}
        referenceId={condition.referenceId!}
        placeholder={condition.label}
        text={value}
        onTextChange={onChange}
        onPick={option => onChange(option.label)}
      />
    );
  }

  if (condition.type === 'select') {
    return (
      <Select
        name={condition.name}
        items={[...(condition.options ?? [])]}
        value={value === '' ? null : value}
        onValueChange={next => onChange(next ?? '')}
        placeholder="—"
      />
    );
  }

  if (condition.type === 'text') {
    return (
      <Input
        name={condition.name}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    );
  }

  return <Static boxed>{value}</Static>;
}
