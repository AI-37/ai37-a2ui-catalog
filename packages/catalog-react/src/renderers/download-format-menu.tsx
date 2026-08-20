import React from 'react';
import {agentResourceConvertUrl} from './agent-resource-convert-url';

/**
 * «Скачать ▾» — dropdown форматов протокола (план report-download-thread-attachments, ред. 2):
 * `.md` — прямая ссылка на `downloadUrl` (прозрачный проброс `/api/agent-resource`, прод-поведение),
 * `.docx` — конверт-сервис chat-backend (`/api/agent-resource/convert?format=docx&…`).
 * Нативный `<details>` (как протокольный кат) — без порталов и внешних зависимостей;
 * download-заголовки ставит сервер, атрибут `download` у ссылок режет санитайзер хоста.
 * Если docx-URL не выводится из downloadUrl (чужая форма URL) — остаётся один пункт `.md`.
 */
export function DownloadFormatMenu({
  downloadUrl,
  buttonClassName,
}: {
  downloadUrl: string;
  buttonClassName: string;
}) {
  const docxUrl = agentResourceConvertUrl(downloadUrl, 'docx');

  return (
    <details className="a2ui-dfm">
      <summary className={`${buttonClassName} a2ui-dfm__toggle`}>Скачать ▾</summary>
      <div className="a2ui-dfm__list" role="menu">
        <a className="a2ui-dfm__item" role="menuitem" href={downloadUrl}>
          Markdown (.md)
        </a>
        {docxUrl !== undefined ? (
          <a className="a2ui-dfm__item" role="menuitem" href={docxUrl}>
            Word (.docx)
          </a>
        ) : null}
      </div>
    </details>
  );
}
