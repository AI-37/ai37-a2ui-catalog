import React from 'react';
import {ReportNote} from './report-note';

/** Оговорка группы исходных данных. Нет оговорки — нет и заметки. */
export function ReportGroupNote({note}: {note: string | undefined}) {
  if (note === undefined) {
    return null;
  }

  return <ReportNote>{note}</ReportNote>;
}
