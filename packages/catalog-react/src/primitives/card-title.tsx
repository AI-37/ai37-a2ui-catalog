import React from 'react';

/** Заголовок карточки без раскрытия. Раскрывашка — это триггер Accordion/Collapsible. */
export function CardTitle({title}: {title: React.ReactNode}) {
  return (
    <h3 className="a2ui-card__heading">
      <span className="a2ui-t--body a2ui-card__title">{title}</span>
    </h3>
  );
}
