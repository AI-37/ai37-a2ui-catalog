import React from 'react';

/** Стилевой слой семейства. У семейств на инлайн-стилях CSS нет — тег не рендерится. */
export function FamilyStyleTag({root, css}: {root: string | null; css: string | null}) {
  if (!css) {
    return null;
  }

  return (
    <style href={`proba-${root}`} precedence="default">
      {css}
    </style>
  );
}
