import type {MenuItem} from '../primitives';
import type {FileDownloader} from './download-text-file';
import {protocolTextFile} from './protocol-text-file';
import type {ReportNextProtocol} from './report-next.types';

/**
 * Пункт меню «Скачать» для протокола без ручки агента: формат один — тот
 * markdown, что пришёл в props. Пункт всё равно пункт, а не голая кнопка:
 * «Скачать» в отчёте выглядит одинаково независимо от того, чем наполнен
 * протокол, иначе два соседних отчёта на экране спорят видом. Чем скачивать —
 * решает хост (`useFileDownloader`).
 */
export function reportNextBlobItems(
  protocol: ReportNextProtocol,
  fileName: string,
  download: FileDownloader,
): MenuItem[] {
  return [
    {
      label: 'Markdown (.md)',
      onSelect: () => void download(protocolTextFile(protocol, fileName)),
    },
  ];
}
