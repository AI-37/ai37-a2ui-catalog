import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {readOptionClimate} from '../../../../packages/catalog-react/src/renderers/read-option-climate';
import type {ConditionsControl, ConditionsNumber, ConditionsState} from './use-conditions.types';

/** Начальные значения — с реального экрана приёмки. */
const INITIAL: ConditionsState = {
  cityText: 'Москва',
  buildingType: 'Жилое многоквартирное',
  condition: 'Б',
  tv: 20,
  tot: -2.2,
  zot: 205,
  tn: -25,
};

/**
 * Состояние блока «Условия». Климат читается из опции справочника тем же
 * `readOptionClimate`, что и в редакторе пакета: подставленные значения
 * остаются редактируемыми.
 */
export function useConditions(): ConditionsControl {
  const [state, setState] = React.useState<ConditionsState>(INITIAL);

  const pickCity = (option: LookupOption) => {
    setState(prev => ({...prev, cityText: option.label, ...readOptionClimate(option)}));
  };

  const setNumber = (key: ConditionsNumber, value: number | null) => {
    setState(prev => ({...prev, [key]: value}));
  };

  return {
    state,
    setCityText: text => setState(prev => ({...prev, cityText: text})),
    pickCity,
    setBuildingType: value => setState(prev => ({...prev, buildingType: value})),
    setCondition: value => setState(prev => ({...prev, condition: value})),
    setNumber,
  };
}
