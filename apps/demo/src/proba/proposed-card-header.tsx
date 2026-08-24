import React from 'react';
import {CardTitle} from './card-title';
import type {CardHeaderProps} from './proposed-card.types';

/** Шапка карточки: заголовок и три слота — статус, пометка, действие. */
export function CardHeader({title, status, badge, action, open, onToggle}: CardHeaderProps) {
  return (
    <div className="a2ui-card__header">
      <CardTitle title={title} open={open} onToggle={onToggle} />
      {status}
      {badge}
      {action}
    </div>
  );
}
