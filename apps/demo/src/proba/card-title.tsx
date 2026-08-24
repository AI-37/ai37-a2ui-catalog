import React from 'react';
import {ChevronIcon} from './proba-icons';
import {ProposedButton} from './proposed-button';
import type {CardTitleProps} from './proposed-card.types';

/** Заголовок карточки: с `onToggle` — кнопка-раскрывашка, без него обычный заголовок. */
export function CardTitle({title, open, onToggle}: CardTitleProps) {
  if (!onToggle) {
    return (
      <h3 className="a2ui-card__title">
        <span className="a2ui-t--body">{title}</span>
      </h3>
    );
  }

  return (
    <ProposedButton
      variant="link"
      className="a2ui-card__title"
      aria-expanded={open === true}
      onClick={onToggle}
    >
      <ChevronIcon open={open === true} />
      <span className="a2ui-t--body">{title}</span>
    </ProposedButton>
  );
}
