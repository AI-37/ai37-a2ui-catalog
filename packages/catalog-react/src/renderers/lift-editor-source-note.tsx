import React from 'react';
import {fieldSourceLabel} from './field-source-label';
import type {LiftEditorSourceNoteProps} from './lift-editor.types';

/**
 * Подпись источника под контролом: обоснование агента (`note`) или название
 * источника словами из общего словаря каталога. Provenance — только подпись:
 * оформление самого контрола от источника не меняется, ничего не блокируется
 * (Решение 7 design lift-editor-sections-responsive). У `suggested`/`question`
 * подпись акцентная, `default` дополнительно помечен точкой.
 */
export function LiftEditorSourceNote({source}: LiftEditorSourceNoteProps) {
  const accent = source.source === 'suggested' || source.source === 'question';

  return (
    <span className={`a2ui-le-caption${accent ? ' a2ui-le-caption--accent' : ''}`}>
      {source.source === 'default' ? <span className="a2ui-le-dot" aria-hidden="true" /> : null}
      {source.note ?? fieldSourceLabel(source.source)}
    </span>
  );
}
