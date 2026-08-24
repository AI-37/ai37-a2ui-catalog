import React from 'react';

/** Подстрока варианта. Нет её — карточка заканчивается титулом и пилюлями. */
export function LiftNextRecommendSubtitle({subtitle}: {subtitle: string | undefined}) {
  if (subtitle === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{subtitle}</span>;
}
