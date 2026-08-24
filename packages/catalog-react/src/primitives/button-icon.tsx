import React from 'react';

/** Иконка кнопки. Без иконки узел не появляется — пустой span сдвинул бы подпись на gap. */
export function ButtonIcon({icon}: {icon: React.ReactNode}) {
  if (!icon) {
    return null;
  }

  return <span className="a2ui-btn__icon">{icon}</span>;
}
