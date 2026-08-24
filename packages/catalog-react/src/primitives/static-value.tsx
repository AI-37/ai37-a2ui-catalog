import React from 'react';

/** Значение вместо контрола: коробка поля звала бы править то, что считает агент. */
export function Static({children}: {children: React.ReactNode}) {
  return <span className="a2ui-static a2ui-t--body">{children}</span>;
}
