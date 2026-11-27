import React from 'react';
import type {KeoReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {useProtocolDownload} from './use-protocol-download';
import {useA2uiMessages} from '../i18n';

/**
 * «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta и «Скачать»
 * (при `downloadFileName`). Содержимое в UI не показывается; «Скачать» отдаёт
 * `downloadContent ?? content` загрузчиком хоста, по умолчанию клиентским
 * Blob'ом — агент и транспорт не участвуют (канон после
 * thermal-report-standard-buttons).
 */
export function KeoReportProtocolCard({protocol}: {protocol: KeoReportProtocol}) {
  const m = useA2uiMessages();
  const handleDownload = useProtocolDownload(protocol);

  return (
    <div className="a2ui-kr__protocol">
      <span className="a2ui-kr__protocol-title">{m.report.protocol}</span>
      {protocol.meta ? <span className="a2ui-kr__protocol-meta">{protocol.meta}</span> : null}
      {handleDownload !== undefined ? (
        <button
          type="button"
          className="a2ui-kr-btn a2ui-kr-btn--link a2ui-kr__protocol-download"
          onClick={handleDownload}
        >
          {m.common.download}
        </button>
      ) : null}
    </div>
  );
}
