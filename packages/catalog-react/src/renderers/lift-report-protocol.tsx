import React from 'react';
import type {LiftReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {DownloadFormatMenu} from './download-format-menu';
import {LiftReportChevron} from './lift-report-chevron';

/**
 * «Протокол расчёта» — нативный `<details>`: строка-сводка (лейбл, `meta`,
 * «Скачать», шеврон) раскрывает краткий вывод `content`. Полная простыня в
 * props не приходит вовсе — она живёт на ручке агента.
 *
 * «Скачать» — dropdown форматов по относительному `downloadUrl`
 * (`/api/agent-resource?…`): `.md` — прямая ссылка (download-заголовки ставит
 * сервер агента), `.docx` — конверт-сервис chat-backend (план
 * report-download-thread-attachments, ред. 2). Интерактив внутри `<summary>`
 * протокол не раскрывает — activation behavior достаётся вложенному элементу,
 * а не `<summary>`. Нет URL — нет меню.
 */
export function LiftReportProtocolCard({protocol}: {protocol: LiftReportProtocol}) {
  return (
    <details className="a2ui-lr__protocol">
      <summary className="a2ui-lr__protocol-head">
        <span className="a2ui-lr__protocol-title">Протокол расчёта</span>
        {protocol.meta ? <span className="a2ui-lr__protocol-meta">{protocol.meta}</span> : null}
        {protocol.downloadUrl !== undefined ? (
          <span className="a2ui-lr__protocol-download">
            <DownloadFormatMenu
              downloadUrl={protocol.downloadUrl}
              buttonClassName="a2ui-lr-btn a2ui-lr-btn--link"
            />
          </span>
        ) : null}
        <LiftReportChevron />
      </summary>
      <pre className="a2ui-lr__protocol-body">{protocol.content}</pre>
    </details>
  );
}
