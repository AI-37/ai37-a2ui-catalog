import type React from 'react';

/** Тон пилюли: проходит, не проходит, предупреждение, справочная строка. */
export type StatusPillTone = 'pass' | 'fail' | 'warning' | 'neutral';

/**
 * Кегль. `badge` — вердикт отчёта: подпись над заголовком, uppercase с
 * разрядкой. `row` — статус строки списка. Четвёртой ступени шкалы под них
 * не заводится: обе стоят на ступени `sub`, разводит их модификатор набора.
 */
export type StatusPillSize = 'badge' | 'row';

export interface StatusPillProps {
  tone: StatusPillTone;
  size?: StatusPillSize | undefined;
  children: React.ReactNode;
}
