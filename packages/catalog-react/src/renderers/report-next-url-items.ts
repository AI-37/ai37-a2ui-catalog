import type {MenuItem} from '../primitives';
import {reportDocxUrl} from './report-docx-url';

/**
 * Пункты меню «Скачать» при ссылке на протокол: `.md` — прямая ссылка, `.docx` —
 * рендер chat-backend (артефакт с `format=docx` или конверт-сервис ресурса агента,
 * см. `reportDocxUrl`). Формат не выводится из URL (чужая форма) — пункта просто
 * нет, вторую кнопку заводить не за чем.
 *
 * Пункты — ссылки, а не действия: download-заголовки ставит сервер.
 */
export function reportNextUrlItems(downloadUrl: string): MenuItem[] {
  const docxUrl = reportDocxUrl(downloadUrl);
  const items: MenuItem[] = [{label: 'Markdown (.md)', href: downloadUrl}];

  if (docxUrl !== undefined) {
    items.push({label: 'Word (.docx)', href: docxUrl});
  }

  return items;
}
