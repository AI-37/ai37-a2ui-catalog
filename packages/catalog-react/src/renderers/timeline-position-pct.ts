/**
 * Положение минуты на оси таймлайна в процентах ширины полосы. Единственная
 * арифметика отчёта инсоляции: без неё сегмент не нарисовать (прецедент
 * `deviationPct` ThermalReport). Значения вне оси прижимаются к краям — полоса
 * не должна вылезать за карточку из-за данных агента.
 */
export function timelinePositionPct(minute: number, axisStart: number, axisEnd: number): number {
  const span = axisEnd - axisStart;
  if (span <= 0) return 0;

  const ratio = (minute - axisStart) / span;

  return Math.min(100, Math.max(0, Math.round(ratio * 10000) / 100));
}
