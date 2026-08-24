import React from 'react';
import type {CardHeaderProps} from './card.types';

/**
 * Шапка карточки: заголовок и три слота — статус, пометка, действие.
 * Раскрытием шапка не владеет: кнопку-раскрывашку приносит `title` от
 * `Accordion`/`Collapsible`, у которых своё состояние и свой `aria-controls`.
 */
export function CardHeader({title, status, badge, action}: CardHeaderProps) {
  return (
    <div className="a2ui-card__header">
      {title}
      {status}
      {badge}
      {action}
    </div>
  );
}
