import React from 'react';
import {ReportProtocolCard} from '../primitives';
import {ReportNextDownload} from './report-next-download';
import type {ReportNextProtocol} from './report-next.types';

/**
 * «Протокол расчёта» — одна строка: лейбл, мета и «Скачать ⌄». Не
 * раскрывается, и `protocol.content` на экране не выводится вовсе: краткий
 * вывод в чате никто не читает построчно, а полная простыня уезжает файлом.
 * Так снято расхождение отчётов — `<details>` с `<pre>` у лифтов остался в
 * прошлом вместе с раскрытием.
 */
export function ReportNextProtocolCard({protocol}: {protocol: ReportNextProtocol | undefined}) {
  if (protocol === undefined) {
    return null;
  }

  return (
    <ReportProtocolCard
      label="Протокол расчёта"
      meta={protocol.meta}
      action={<ReportNextDownload protocol={protocol} />}
    />
  );
}
