import React from 'react';
import type {ConstructionsEditorSourceNoteProps} from './constructions-editor.types';
import {fieldSourceLabel} from './field-source-label';

/**
 * Подпись источника под контролом: обоснование агента (`note`) или, если его
 * нет, название источника словами — без пустого хвоста. Цвет подписи совпадает
 * с цветом рамки контрола: у `suggested`/`question` акцентный, у остальных
 * приглушённый; `default` дополнительно помечен точкой.
 *
 * Подпись ничего не блокирует — это оформление, а не запрет (Решение 4
 * design.md).
 */
export function ConstructionsEditorSourceNote({source}: ConstructionsEditorSourceNoteProps) {
  const accent = source.source === 'suggested' || source.source === 'question';

  return (
    <span className={`a2ui-ce-note${accent ? ' a2ui-ce-note--accent' : ''}`}>
      {source.source === 'default' ? <span className="a2ui-ce-dot" aria-hidden="true" /> : null}
      {source.note ?? fieldSourceLabel(source.source)}
    </span>
  );
}
