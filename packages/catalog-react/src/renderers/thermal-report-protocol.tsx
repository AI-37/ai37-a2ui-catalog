import React from 'react';
import type {ThermalReportProtocol} from '@ai37/a2ui-catalog-schemas';

/**
 * «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta и «Скачать»
 * (при `downloadFileName`). Краткий вывод `content` в UI не показывается —
 * он остаётся fallback-содержимым скачивания при отсутствии `downloadContent`.
 * «Скачать» отдаёт содержимое клиентским Blob'ом — агент и транспорт не
 * участвуют.
 */
export function ThermalReportProtocolCard({protocol}: {protocol: ThermalReportProtocol}) {
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
    <div className="a2ui-tr__protocol">
      <span className="a2ui-tr__protocol-title">Протокол расчёта</span>
      {protocol.meta ? <span className="a2ui-tr__protocol-meta">{protocol.meta}</span> : null}
      {protocol.downloadFileName !== undefined ? (
        <button
          type="button"
          className="a2ui-tr-btn a2ui-tr-btn--link a2ui-tr__protocol-download"
          onClick={handleDownload}
        >
          Скачать
        </button>
      ) : null}
    </div>
  );
}
