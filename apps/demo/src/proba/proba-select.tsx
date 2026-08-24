import React from 'react';

/** Выпадающий список. Оформление контрола общее с `Input`. */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="a2ui-control a2ui-t--body" />;
}
