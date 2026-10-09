import React from 'react';
import {reportDocxUrl} from './report-docx-url';
import {saveToProjectLabel} from './save-to-project-label';
import {useReportSaveToProject} from './use-report-save-to-project';

/**
 * «Скачать ▾» — dropdown форматов протокола (план report-download-thread-attachments, ред. 2):
 * `.md` — прямая ссылка на `downloadUrl` (прозрачный проброс `/api/agent-resource`, прод-поведение),
 * `.docx` — рендер chat-backend: конверт-сервис ресурса агента
 * (`/api/agent-resource/convert?format=docx&…`) или артефакт с `format=docx` (`reportDocxUrl`).
 * Нативный `<details>` (как протокольный кат) — без порталов и внешних зависимостей;
 * download-заголовки ставит сервер, атрибут `download` у ссылок режет санитайзер хоста.
 * Если docx-URL не выводится из downloadUrl (чужая форма URL) — остаётся один пункт `.md`.
 *
 * Протокол-артефакт (`/api/artifacts/<uuid>/…`) при хосте с `onSaveToProject` получает
 * пункт «Сохранить в проект» (план files-and-artifacts-layer §3.4) — тот же вызов хоста,
 * что у `ArtifactCard`.
 */
export function DownloadFormatMenu({
  downloadUrl,
  buttonClassName,
}: {
  downloadUrl: string;
  buttonClassName: string;
}) {
  const docxUrl = reportDocxUrl(downloadUrl);
  const save = useReportSaveToProject(downloadUrl);

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
        {save.canSave ? (
          <button
            type="button"
            className="a2ui-dfm__item a2ui-dfm__item--action"
            role="menuitem"
            disabled={save.state === 'saving' || save.state === 'saved'}
            onClick={save.save}
          >
            {saveToProjectLabel(save.state)}
          </button>
        ) : null}
      </div>
    </details>
  );
}
