import React from 'react';
import type {LiftReportProtocol} from '@ai37/a2ui-catalog-schemas';
import {LiftReportChevron} from './lift-report-chevron';

/**
 * «Протокол расчёта» — нативный `<details>`: строка-сводка (лейбл, `meta`,
 * «Скачать», шеврон) раскрывает краткий вывод `content`. Полная простыня в
 * props не приходит вовсе — она живёт на ручке агента.
 *
 * «Скачать» — обычная ссылка на относительный `downloadUrl`
 * (`/api/agent-resource?…`): download-заголовки ставит сервер агента, а не
 * клиент. Клик по ссылке внутри `<summary>` протокол не раскрывает — activation
 * behavior достаётся вложенному `<a>`, а не `<summary>`. Нет URL — нет ссылки.
 */
export function LiftReportProtocolCard({protocol}: {protocol: LiftReportProtocol}) {
  return (
    <details className="a2ui-lr__protocol">
      <summary className="a2ui-lr__protocol-head">
        <span className="a2ui-lr__protocol-title">Протокол расчёта</span>
        {protocol.meta ? <span className="a2ui-lr__protocol-meta">{protocol.meta}</span> : null}
        {protocol.downloadUrl !== undefined ? (
          <a
            className="a2ui-lr-btn a2ui-lr-btn--link a2ui-lr__protocol-download"
            href={protocol.downloadUrl}
          >
            Скачать
          </a>
        ) : null}
        <LiftReportChevron />
      </summary>
      <pre className="a2ui-lr__protocol-body">{protocol.content}</pre>
    </details>
  );
}
