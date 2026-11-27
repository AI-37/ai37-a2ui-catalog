import React from 'react';
import {calcFieldSourceLabel} from './calc-field-source-label';
import type {CalcSourceNoteProps} from './calc-editor.types';
import {useA2uiMessages} from '../i18n';

/**
 * Подпись под контролом расчётного редактора: «изменено вами» у правленного
 * поля, иначе обоснование агента (`note`) либо название источника словами, а
 * без источника — `hint` поля. Provenance — только подпись: оформление
 * контрола от источника не меняется и ничего не блокируется (канон CE/LE).
 * `assumption` дополнительно помечен точкой — допущение видно взглядом.
 */
export function CalcSourceNote({prefix, source, edited, hint}: CalcSourceNoteProps) {
  const m = useA2uiMessages();
  if (edited) {
    return <span className={`a2ui-${prefix}-caption`}>{m.calcSource.edited}</span>;
  }

  if (source === undefined) {
    return hint ? <span className={`a2ui-${prefix}-caption`}>{hint}</span> : null;
  }

  const accent = source.source === 'suggested' || source.source === 'question';

  return (
    <span className={`a2ui-${prefix}-caption${accent ? ` a2ui-${prefix}-caption--accent` : ''}`}>
      {source.source === 'assumption' ? (
        <span className={`a2ui-${prefix}-dot`} aria-hidden="true" />
      ) : null}
      {source.note ?? calcFieldSourceLabel(source.source, m)}
    </span>
  );
}
