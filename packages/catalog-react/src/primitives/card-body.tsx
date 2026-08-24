import React from 'react';

/** Тело карточки: свои отступы, поэтому отдельным компонентом, а не просто `children`. */
export function CardBody({children}: {children: React.ReactNode}) {
  return <div className="a2ui-card__body">{children}</div>;
}
