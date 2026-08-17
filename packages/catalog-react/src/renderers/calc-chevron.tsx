import React from 'react';

/**
 * Шеврон раскрытия расчётных редакторов: вправо — свёрнуто, вниз (поворот) —
 * раскрыто. Общий файл на КЕО и инсоляцию, классы задаёт `prefix` (канон
 * `LiftEditorChevron`, но без привязки к компоненту).
 */
export function CalcChevron({prefix, open}: {prefix: 'ke' | 'ie'; open: boolean}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className={`a2ui-${prefix}-chevron${open ? ` a2ui-${prefix}-chevron--open` : ''}`}
    >
      <path
        d="M3.5 1.5 L7 5 L3.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
