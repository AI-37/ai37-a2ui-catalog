import React from 'react';

/**
 * Шеврон раскрытия: вправо — свёрнуто, вниз (поворот) — раскрыто. Один знак в
 * обоих состояниях у баннера секции, шапки раскрытой секции и блока дефолтов.
 */
export function LiftEditorChevron({open}: {open: boolean}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className={`a2ui-le-chevron${open ? ' a2ui-le-chevron--open' : ''}`}
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
