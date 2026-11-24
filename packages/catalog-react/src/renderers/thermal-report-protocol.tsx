import React from 'react';
import type {ThermalReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {DownloadFormatMenu} from './download-format-menu';
import {useProtocolDownload} from './use-protocol-download';
import {useA2uiMessages} from '../i18n';

/**
 * «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta и «Скачать».
 * При `downloadUrl` — dropdown форматов (`.md` — прямая ссылка на ручку агента,
 * `.docx` — конверт-сервис chat-backend, план report-download-thread-attachments
 * ред. 2). Без URL — файл по `downloadFileName` загрузчиком хоста, по
 * умолчанию клиентским Blob'ом (обратная совместимость со старыми payload'ами;
 * агент и транспорт не участвуют).
 */
export function ThermalReportProtocolCard({protocol}: {protocol: ThermalReportProtocol}) {
  const m = useA2uiMessages();
  const handleDownload = useProtocolDownload(protocol);

  return (
    <div className="a2ui-tr__protocol">
      <span className="a2ui-tr__protocol-title">{m.report.protocol}</span>
      {protocol.meta ? <span className="a2ui-tr__protocol-meta">{protocol.meta}</span> : null}
      {protocol.downloadUrl !== undefined ? (
        <span className="a2ui-tr__protocol-download">
          <DownloadFormatMenu
            downloadUrl={protocol.downloadUrl}
            buttonClassName="a2ui-tr-btn a2ui-tr-btn--link"
          />
        </span>
      ) : handleDownload !== undefined ? (
        <button
          type="button"
          className="a2ui-tr-btn a2ui-tr-btn--link a2ui-tr__protocol-download"
          onClick={handleDownload}
        >
          {m.common.download}
        </button>
      ) : null}
    </div>
  );
}
