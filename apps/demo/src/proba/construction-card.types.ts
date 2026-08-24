/** Слой конструкции: название и правая колонка с толщиной и λ. */
export interface ConstructionLayer {
  title: string;
  meta: string;
}

export interface ConstructionEntry {
  id: string;
  title: string;
  /** Пилюля Rпр с итогом сравнения. */
  chip: string;
  pass: boolean;
  /** Строка типа конструкции над слоями; есть не у всех. */
  type?: string;
  layers?: ConstructionLayer[];
}
