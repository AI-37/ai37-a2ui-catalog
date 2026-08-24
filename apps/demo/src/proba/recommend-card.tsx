import React from 'react';
import {Button, Card} from '@ai37/a2ui-catalog-react/primitives';
import {applyRecommendVariant} from './apply-recommend-variant';
import {RecommendCardNotes} from './recommend-card-notes';
import {RecommendCardSubtitle} from './recommend-card-subtitle';
import type {RecommendVariant} from './recommend.types';

/**
 * Карточка варианта: титул, подстрока, заметки пилюлями, кнопка применения.
 * Кнопка `outline` — тот же вес, что у «Пересчитать» в отчёте: принять
 * предложенное, а не главное действие экрана (главное — «Рассчитать» внизу).
 *
 * Кликабельной карточку не делаем: `Card onClick` рендерит кнопку, и пилюли
 * с кнопкой внутри неё стали бы содержимым кнопки.
 */
export function RecommendCard({variant, applyLabel}: {variant: RecommendVariant; applyLabel: string}) {
  return (
    <Card>
      <div className="a2ui-recommend__card">
        <span className="a2ui-t--body a2ui-t--strong">{variant.title}</span>
        <RecommendCardSubtitle subtitle={variant.subtitle} />
        <RecommendCardNotes notes={variant.notes} tone={variant.tone} />
        <Button variant="outline" onClick={() => applyRecommendVariant(variant)}>
          {applyLabel}
        </Button>
      </div>
    </Card>
  );
}
