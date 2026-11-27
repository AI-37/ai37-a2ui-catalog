/** Границы мира чертежа, метры: X вправо, Y вверх. */
export interface DrawingBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/**
 * Преобразование мир → экран одного листа. Пиксели живут только здесь: в
 * модели чертежа их нет, а примитивы получают вид из контекста.
 */
export interface DrawingView {
  /** Цена деления листа, px на метр. */
  pxPerMeter: number;
  /** Размер холста, px. */
  width: number;
  height: number;
  /** Мир (метры) → экран (px). */
  toScreen: (x: number, y: number) => {px: number; py: number};
  /** `url(#…)` штриховки сечений — id свой у каждого листа. */
  hatchFill: string;
}
