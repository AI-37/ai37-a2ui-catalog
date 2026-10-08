import {agentResourceConvertUrl} from './agent-resource-convert-url';

/**
 * Протокол из выходной полки chat-backend: `…/api/artifacts/<id>/content?format=md`
 * (план files-and-artifacts-layer §3.4). Хвост URL — ровно `format=md`, иначе форма чужая.
 */
const ARTIFACT_MD_URL = /\/api\/artifacts\/([^/?#]+)\/content\?format=md$/;

/**
 * DOCX-ссылка для меню «Скачать» по `protocol.downloadUrl` отчёта. Транспорта два:
 *  - артефакт (`/api/artifacts/<id>/content?format=md`) → тот же путь с `format=docx`,
 *    DOCX из markdown рендерит chat-backend;
 *  - ресурс агента (`/api/agent-resource?…`) → конверт-сервис chat-backend
 *    (`/api/agent-resource/convert?format=docx&…`).
 * Другая форма URL — не наш транспорт: undefined, пункта `.docx` в меню просто нет.
 */
export function reportDocxUrl(downloadUrl: string): string | undefined {
  const artifact = ARTIFACT_MD_URL.exec(downloadUrl);
  if (artifact !== null) {
    return `${downloadUrl.slice(0, artifact.index)}/api/artifacts/${artifact[1]}/content?format=docx`;
  }
  return agentResourceConvertUrl(downloadUrl, 'docx');
}
