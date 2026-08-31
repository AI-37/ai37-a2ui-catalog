/**
 * Палитра чертежа — только семантические токены набора: литералов цвета в
 * листе нет, поэтому тёмная тема приезжает тем же путём, что и у остальных
 * частей отчёта (`light-dark()` в `kit-tokens`).
 *
 * Серые ступени напечатанной подложки графика набраны от приглушённого текста
 * через `color-mix`: своей шкалы серого у набора нет, а три ступени подложке
 * нужны — жирные линии, тонкие полуокружности и паутина лучей.
 */
export const DRAWING_INK = 'var(--a2ui-text-color)';
export const DRAWING_RED = 'var(--a2ui-text-color-danger)';
export const DRAWING_BLUE = 'var(--a2ui-text-color-accent)';
export const DRAWING_SHEET = 'var(--a2ui-card-surface-plain)';

export const DRAWING_HATCH = 'color-mix(in srgb, var(--a2ui-text-color-muted) 70%, transparent)';
export const DRAWING_FAN_MAJOR = 'color-mix(in srgb, var(--a2ui-text-color-muted) 80%, transparent)';
export const DRAWING_FAN_MINOR = 'color-mix(in srgb, var(--a2ui-text-color-muted) 42%, transparent)';
export const DRAWING_FAN_RAY = 'color-mix(in srgb, var(--a2ui-text-color-muted) 34%, transparent)';
export const DRAWING_FAN_NUM = 'var(--a2ui-text-color-muted)';
