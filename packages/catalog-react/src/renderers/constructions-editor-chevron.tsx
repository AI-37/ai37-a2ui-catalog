import React from 'react';

/**
 * Шеврон раскрытия: вправо — свёрнуто, вниз (поворот) — раскрыто. Общий для
 * карточки конструкции и свёрнутой строки условий: оба блока раскрываются
 * одним жестом, и значок у них должен быть один.
 */
export function ConstructionsEditorChevron({open}: {open: boolean}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      className={`a2ui-ce-chevron${open ? ' a2ui-ce-chevron--open' : ''}`}
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
