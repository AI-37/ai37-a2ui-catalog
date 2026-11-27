import React from 'react';
import {SourceNote} from '../primitives';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {LiftNextFieldNoteProps} from './lift-next.types';

/**
 * Подпись под контролом. Строка одна, приоритет: подпись правила (`note`,
 * нормативное предупреждение) → источник значения → подсказка поля. Подпись
 * правила сильнее источника: предупреждение «ниже минимума СП» важнее, чем
 * «из вашего вопроса» (change `lift-editor-note-rules`).
 */
export function LiftNextFieldNote({source, hint, note}: LiftNextFieldNoteProps) {
  if (note !== undefined) {
    const toneClass = note.tone === 'muted' ? 'a2ui-t--muted' : 'a2ui-t--warning';
    return (
      <span className={`a2ui-t--sub ${toneClass}`} role={note.tone === 'muted' ? undefined : 'status'}>
        {note.text}
      </span>
    );
  }

  if (source !== undefined) {
    return <SourceNote source={source} />;
  }

  if (hint === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{renderLabelSubscripts(hint)}</span>;
}
