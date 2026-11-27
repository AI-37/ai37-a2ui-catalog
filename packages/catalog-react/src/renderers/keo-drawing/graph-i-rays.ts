/**
 * Лучи веера графика Данилюка I — **константа отрисовки, а не расчёт**: луч
 * номер k стоит под углом arcsin(k/50) от зенита, и от данных помещения это
 * не зависит (Решение 2 design.md `keo-report-drawings`). Закон графика II —
 * другой: он зависит от θ, и его азимуты приезжают числами от агента.
 */
export interface GraphIRay {
  k: number;
  /** Угол от зенита, рад. */
  angleFromZenith: number;
  /** Сторона от вертикальной оси веера. */
  side: -1 | 1;
}

export function graphIRays(): GraphIRay[] {
  const rays: GraphIRay[] = [];

  for (let k = 1; k <= 49; k++) {
    const angleFromZenith = Math.asin(k / 50);
    rays.push({k, angleFromZenith, side: -1});
    rays.push({k, angleFromZenith, side: 1});
  }

  return rays;
}

/**
 * Номера полуокружностей напечатанного листа: №4 и №50 на нём не проводят
 * (errata keo-expert, п. 15), остальные — включая мелкие у полюса — есть.
 */
export const GRAPH_CIRCLE_INDICES: number[] = Array.from({length: 49}, (_, i) => i + 1).filter(
  index => index !== 4,
);
