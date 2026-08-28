import React from 'react';
import type {CalcCondition} from '@ai37/a2ui-catalog-schemas';
import {Form} from '../primitives';
import {KeoNextCondition} from './keo-next-condition';
import type {KeoConditionsProps} from './keo-next.types';

/**
 * Условия расчёта — та же сетка формы, что у полей помещения: на макете это
 * поля, а не строки текста.
 *
 * Правится то, что агент взял из проекта (город строительства): проект бывает
 * не тот, и правка меняет расчёт, а не данные проекта. Выведенное из него —
 * норматив e_н и методика — остаётся значением: его пересчитывает агент.
 */
export function KeoNextConditions({control, conditions}: KeoConditionsProps) {
  return (
    <Form columns={2}>
      {conditions.map((condition: CalcCondition) => (
        <KeoNextCondition key={condition.name} control={control} condition={condition} />
      ))}
    </Form>
  );
}
