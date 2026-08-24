import React from 'react';

/** Текстовое или числовое поле ввода. */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="a2ui-control a2ui-t--body" />;
}
