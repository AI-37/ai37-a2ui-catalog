import React from 'react';
import {SourceNote} from '../primitives';
import {CALC_EDITED_LABEL} from './calc-field-source-label';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import type {KeoSourceNoteProps} from './keo-next.types';

/**
 * Подпись под контролом: «изменено вами» у правленного поля, иначе источник
 * значения примитивом набора, а без источника — подсказка поля.
 *
 * Provenance — только подпись: оформление контрола от источника не меняется и
 * ничего не блокируется (канон CE/LE).
 */
export function KeoNextSourceNote({source, edited, hint}: KeoSourceNoteProps) {
  if (edited) {
    return <span className="a2ui-t--sub a2ui-t--muted">{CALC_EDITED_LABEL}</span>;
  }

  if (source !== undefined) {
    return <SourceNote source={source} />;
  }

  if (hint === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{renderLabelSubscripts(hint)}</span>;
}
