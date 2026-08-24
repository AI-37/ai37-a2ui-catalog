import React from 'react';

/** Контекст в шапке карточки («Проект „ЖК Северный, к.3“»); без него строки нет. */
export function LiftNextHeaderContext({context}: {context: string | undefined}) {
  if (context === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{context}</span>;
}
