import type {MenuItem} from '@ai37/a2ui-catalog-react/primitives';
import {agentResourceConvertUrl} from '../../../../packages/catalog-react/src/renderers/agent-resource-convert-url';

/**
 * Пункты меню «Скачать»: `.md` — прямая ссылка на ручку агента, `.docx` —
 * конверт-сервис chat-backend. Формат не выводится из URL (чужая форма) —
 * пункта просто нет, вторую кнопку заводить не за чем.
 *
 * Пункты — ссылки, а не действия: download-заголовки ставит сервер.
 */
export function downloadFormatItems(downloadUrl: string): MenuItem[] {
  const docxUrl = agentResourceConvertUrl(downloadUrl, 'docx');
  const items: MenuItem[] = [{label: 'Markdown (.md)', href: downloadUrl}];

  if (docxUrl !== undefined) {
    items.push({label: 'Word (.docx)', href: docxUrl});
  }

  return items;
}
