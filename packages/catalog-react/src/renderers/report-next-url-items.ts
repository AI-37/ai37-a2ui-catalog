import type {MenuItem} from '../primitives';
import {agentResourceConvertUrl} from './agent-resource-convert-url';

/**
 * Пункты меню «Скачать» при ручке агента: `.md` — прямая ссылка, `.docx` —
 * конверт-сервис chat-backend. Формат не выводится из URL (чужая форма) —
 * пункта просто нет, вторую кнопку заводить не за чем.
 *
 * Пункты — ссылки, а не действия: download-заголовки ставит сервер.
 */
export function reportNextUrlItems(downloadUrl: string): MenuItem[] {
  const docxUrl = agentResourceConvertUrl(downloadUrl, 'docx');
  const items: MenuItem[] = [{label: 'Markdown (.md)', href: downloadUrl}];

  if (docxUrl !== undefined) {
    items.push({label: 'Word (.docx)', href: docxUrl});
  }

  return items;
}
