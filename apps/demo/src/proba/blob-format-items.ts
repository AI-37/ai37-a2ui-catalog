import type {MenuItem} from '@ai37/a2ui-catalog-react/primitives';
import {downloadProtocolBlob} from './download-protocol-blob';
import type {ReportProtocol} from './report-assembly.types';

/**
 * Пункт меню «Скачать» для протокола без ручки агента: формат один — тот
 * markdown, что пришёл в props. Пункт всё равно пункт, а не голая кнопка:
 * «Скачать» в отчёте выглядит одинаково независимо от того, чем наполнен
 * протокол, иначе два соседних отчёта на экране спорят видом.
 */
export function blobFormatItems(protocol: ReportProtocol, fileName: string): MenuItem[] {
  return [{label: 'Markdown (.md)', onSelect: () => downloadProtocolBlob(protocol, fileName)}];
}
