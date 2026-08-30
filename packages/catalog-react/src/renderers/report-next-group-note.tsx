import React from 'react';
import {ReportNote} from '../primitives';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';

/** Оговорка группы исходных данных. Нет оговорки — нет и заметки. */
export function ReportNextGroupNote({note}: {note: string | undefined}) {
  if (note === undefined) {
    return null;
  }

  return <ReportNote>{renderLabelSubscripts(note)}</ReportNote>;
}
