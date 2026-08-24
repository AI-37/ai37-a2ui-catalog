import React from 'react';
import {Button, Card} from '../primitives';
import {LiftNextRecommendNotes} from './lift-next-recommend-notes';
import {LiftNextRecommendSubtitle} from './lift-next-recommend-subtitle';
import type {LiftNextRecommendCardProps} from './recommend.types';

/**
 * Карточка варианта: титул, подстрока, заметки пилюлями, кнопка применения.
 * Кнопка `outline` — принять предложенное, а не главное действие экрана
 * (главное — «Рассчитать» в подвале, и второй заливки рядом с ним быть не
 * должно).
 *
 * Кликабельной карточку не делаем: `Card onClick` рендерит кнопку, и пилюли с
 * кнопкой внутри неё стали бы содержимым кнопки.
 */
export function LiftNextRecommendCard({
  variant,
  applyLabel,
  onApply,
}: LiftNextRecommendCardProps) {
  return (
    <Card>
      <div className="a2ui-recommend__card">
        <span className="a2ui-t--body a2ui-t--strong">{variant.title}</span>
        <LiftNextRecommendSubtitle subtitle={variant.subtitle} />
        <LiftNextRecommendNotes notes={variant.notes} tone={variant.tone} />
        <Button variant="outline" onClick={() => onApply(variant)}>
          {applyLabel}
        </Button>
      </div>
    </Card>
  );
}
