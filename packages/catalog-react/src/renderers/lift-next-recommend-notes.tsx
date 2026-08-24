import React from 'react';
import type {RecommendResourceVariant} from '@ai37/a2ui-catalog-schemas';
import {Chip} from '../primitives';

/**
 * Заметки варианта пилюлями: интервал, комфортность, поток. Тон берётся у
 * варианта целиком — заметка близ-промаха не ошибка, а оговорка, поэтому
 * `warning`, а не `danger`.
 */
export function LiftNextRecommendNotes({
  notes,
  tone,
}: {
  notes: string[] | undefined;
  tone: RecommendResourceVariant['tone'];
}) {
  if (notes === undefined) {
    return null;
  }

  return (
    <span className="a2ui-recommend__notes">
      {notes.map(note => (
        <Chip key={note} tone={tone === 'near' ? 'warning' : 'neutral'}>
          {note}
        </Chip>
      ))}
    </span>
  );
}
