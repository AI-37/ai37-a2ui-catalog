import React from 'react';

/**
 * Шеврон раскрытия протокола: вправо — свёрнуто, вниз — раскрыто. Поворот
 * задаёт CSS по `[open]` самого `<details>` — пропа состояния нет, потому что
 * раскрытием управляет браузер.
 */
export function LiftReportChevron() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className="a2ui-lr__protocol-chevron"
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
