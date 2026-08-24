import type {LookupOption} from '@ai37/a2ui-catalog-schemas';

/** Числовые поля блока «Условия»: климат подставляется выбором города. */
export type ConditionsNumber = 'tv' | 'tot' | 'zot' | 'tn';

export interface ConditionsState {
  /** Текст поля города: свободный ввод остаётся значением. */
  cityText: string;
  buildingType: string | null;
  condition: string | null;
  tv: number | null;
  tot: number | null;
  zot: number | null;
  tn: number | null;
}

export interface ConditionsControl {
  state: ConditionsState;
  setCityText: (text: string) => void;
  /** Выбор города: подставляет tот/zот/tн из полей опции, ничего не блокируя. */
  pickCity: (option: LookupOption) => void;
  setBuildingType: (value: string | null) => void;
  setCondition: (value: string | null) => void;
  setNumber: (key: ConditionsNumber, value: number | null) => void;
}
