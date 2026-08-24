import React from 'react';
import {Chip} from '@ai37/a2ui-catalog-react/primitives';
import type {RecommendVariant} from './recommend.types';

/**
 * Заметки варианта пилюлями: интервал, комфортность, поток. Тон берётся у
 * варианта целиком — заметка близ-промаха не «ошибка», а оговорка, поэтому
 * `warning`, а не `danger`.
 */
export function RecommendCardNotes({
  notes,
  tone,
}: {
  notes: string[] | undefined;
  tone: RecommendVariant['tone'];
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
