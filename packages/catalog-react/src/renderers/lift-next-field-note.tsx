import React from 'react';
import {SourceNote} from '../primitives';
import {renderLabelSubscripts} from './render-label-subscripts';
import type {LiftNextFieldNoteProps} from './lift-next.types';

/**
 * Подпись под контролом: источник значения, а если поле правлено (источника
 * уже нет) — подсказка поля. Две подписи подряд под узким числовым полем
 * читались бы абзацем, поэтому строка одна.
 */
export function LiftNextFieldNote({source, hint}: LiftNextFieldNoteProps) {
  if (source !== undefined) {
    return <SourceNote source={source} />;
  }

  if (hint === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{renderLabelSubscripts(hint)}</span>;
}
