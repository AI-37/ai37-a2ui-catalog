import React from 'react';
import {Card} from '@ai37/a2ui-catalog-react/primitives';
import {PROBA_PROTOCOL_CSS} from './report-protocol-css';
import {ReportDownload} from './report-download';
import {ReportProtocolMeta} from './report-protocol-meta';
import type {ReportProtocol} from './report-assembly.types';

/**
 * «Протокол расчёта» — одна строка: лейбл, мета и «Скачать ⌄». Не
 * раскрывается: краткий вывод в чате никто не читает построчно, а полная
 * простыня всё равно уезжает файлом. Так снимается расхождение отчётов —
 * `<details>` с `<pre>` у лифтов остаётся в прошлом вместе с ним.
 */
export function ReportProtocolCard({protocol}: {protocol: ReportProtocol | undefined}) {
  if (protocol === undefined) {
    return null;
  }

  return (
    <>
      <style href="proba-report-protocol" precedence="default">
        {PROBA_PROTOCOL_CSS}
      </style>
      <Card>
        <div className="a2ui-protocol">
          <span className="a2ui-t--body a2ui-t--strong">Протокол расчёта</span>
          <ReportProtocolMeta meta={protocol.meta} />
          <span className="a2ui-protocol__download">
            <ReportDownload protocol={protocol} />
          </span>
        </div>
      </Card>
    </>
  );
}
