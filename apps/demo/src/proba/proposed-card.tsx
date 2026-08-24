import React from 'react';
import type {CardProps} from './proposed-card.types';

/** Карточка: уровень берётся из вложенности, кликабельная рендерится кнопкой ради клавиатуры. */
export function Card({tone = 'auto', flat, invalid, onClick, children}: CardProps) {
  const className = [
    'a2ui-card',
    tone !== 'auto' && `a2ui-card--${tone}`,
    flat && 'a2ui-card--flat',
    invalid && 'a2ui-card--invalid',
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <section className={className}>{children}</section>;
}
