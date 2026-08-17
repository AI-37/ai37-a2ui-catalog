import React from 'react';
import type {KeoReportProtocol} from '@ai37/a2ui-catalog-schemas';

/**
 * «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta и «Скачать»
 * (при `downloadFileName`). Содержимое в UI не показывается; «Скачать» отдаёт
 * `downloadContent ?? content` клиентским Blob'ом — агент и транспорт не
 * участвуют (канон после thermal-report-standard-buttons).
 */
export function KeoReportProtocolCard({protocol}: {protocol: KeoReportProtocol}) {
  const handleDownload = () => {
    const blob = new Blob([protocol.downloadContent ?? protocol.content], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = protocol.downloadFileName!;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="a2ui-kr__protocol">
      <span className="a2ui-kr__protocol-title">Протокол расчёта</span>
      {protocol.meta ? <span className="a2ui-kr__protocol-meta">{protocol.meta}</span> : null}
      {protocol.downloadFileName !== undefined ? (
        <button
          type="button"
          className="a2ui-kr-btn a2ui-kr-btn--link a2ui-kr__protocol-download"
          onClick={handleDownload}
        >
          Скачать
        </button>
      ) : null}
    </div>
  );
}
