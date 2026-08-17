import React from 'react';
import type {ThermalReportProtocol} from '@ai37/a2ui-catalog-schemas';

/**
 * «Протокол расчёта» — нативный `<details>`, свёрнут по умолчанию: открытость
 * не зависит от React-стейта и предсказуемо сбрасывается при replace
 * сообщения (Решение 3 design.md). Контент — предформатированный markdown
 * без рендера (моноширинный, со скроллом): под катом — краткий текстовый
 * вывод (`content`), полная markdown-простыня в чат не попадает. «Скачать»
 * (при `downloadFileName`) отдаёт `downloadContent` (простыню) клиентским
 * Blob'ом — агент и транспорт не участвуют.
 */
export function ThermalReportProtocolCard({protocol}: {protocol: ThermalReportProtocol}) {
  const handleDownload = (event: React.MouseEvent) => {
    // Кнопка живёт внутри <summary> — без stopPropagation клик ещё и
    // раскрывал бы протокол.
    event.preventDefault();
    event.stopPropagation();
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
    <details className="a2ui-tr__protocol">
      <summary className="a2ui-tr__protocol-summary">
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
      </summary>
      <pre className="a2ui-tr__protocol-content">{protocol.content}</pre>
    </details>
  );
}
