import React from 'react';
import type {InsolationReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {useProtocolDownload} from './use-protocol-download';
import {useA2uiMessages} from '../i18n';

/**
 * «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta («солнечная
 * геометрия · N шагов») и «Скачать» (при `downloadFileName`). Содержимое в UI
 * не показывается; «Скачать» отдаёт `downloadContent ?? content` загрузчиком
 * хоста, по умолчанию клиентским Blob'ом (канон после
 * thermal-report-standard-buttons).
 */
export function InsolationReportProtocolCard({
  protocol,
}: {
  protocol: InsolationReportProtocol;
}) {
  const m = useA2uiMessages();
  const handleDownload = useProtocolDownload(protocol);

  return (
    <div className="a2ui-ir__protocol">
      <span className="a2ui-ir__protocol-title">{m.report.protocol}</span>
      {protocol.meta ? <span className="a2ui-ir__protocol-meta">{protocol.meta}</span> : null}
      {handleDownload !== undefined ? (
        <button
          type="button"
          className="a2ui-ir-btn a2ui-ir-btn--link a2ui-ir__protocol-download"
          onClick={handleDownload}
        >
          {m.common.download}
        </button>
      ) : null}
    </div>
  );
}
