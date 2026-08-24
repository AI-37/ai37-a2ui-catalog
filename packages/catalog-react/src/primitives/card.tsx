import React from 'react';
import {cardClassName} from './card-class-name';
import type {CardProps} from './card.types';

/** Карточка: уровень берётся из вложенности, кликабельная рендерится кнопкой ради клавиатуры. */
export function Card({tone, flat, invalid, className, onClick, children}: CardProps) {
  const cls = cardClassName({tone, flat, invalid, className});

  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <section className={cls}>{children}</section>;
}
