import React from 'react';
import type {LiftReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {DownloadFormatMenu} from './download-format-menu';
import {LiftReportChevron} from './lift-report-chevron';
import {useProtocolDownload} from './use-protocol-download';
import {useA2uiMessages} from '../i18n';

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
 * а не `<summary>`. Без URL, но с `downloadFileName` — одна кнопка: файл
 * из props отдаёт загрузчик хоста (по умолчанию клиентский Blob).
 */
export function LiftReportProtocolCard({protocol}: {protocol: LiftReportProtocol}) {
  const m = useA2uiMessages();
  const handleDownload = useProtocolDownload(protocol);
  return (
    <details className="a2ui-lr__protocol">
      <summary className="a2ui-lr__protocol-head">
        <span className="a2ui-lr__protocol-title">{m.report.protocol}</span>
        {protocol.meta ? <span className="a2ui-lr__protocol-meta">{protocol.meta}</span> : null}
        {protocol.downloadUrl !== undefined ? (
          <span className="a2ui-lr__protocol-download">
            <DownloadFormatMenu
              downloadUrl={protocol.downloadUrl}
              buttonClassName="a2ui-lr-btn a2ui-lr-btn--link"
            />
          </span>
        ) : handleDownload !== undefined ? (
          <button
            type="button"
            className="a2ui-lr-btn a2ui-lr-btn--link a2ui-lr__protocol-download"
            onClick={handleDownload}
          >
            {m.common.download}
          </button>
        ) : null}
        <LiftReportChevron />
      </summary>
      <pre className="a2ui-lr__protocol-body">{protocol.content}</pre>
    </details>
  );
}
