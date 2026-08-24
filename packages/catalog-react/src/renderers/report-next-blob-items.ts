import type {MenuItem} from '../primitives';
import {downloadReportNextBlob} from './download-report-next-blob';
import type {ReportNextProtocol} from './report-next.types';

/**
 * Пункт меню «Скачать» для протокола без ручки агента: формат один — тот
 * markdown, что пришёл в props. Пункт всё равно пункт, а не голая кнопка:
 * «Скачать» в отчёте выглядит одинаково независимо от того, чем наполнен
 * протокол, иначе два соседних отчёта на экране спорят видом.
 */
export function reportNextBlobItems(protocol: ReportNextProtocol, fileName: string): MenuItem[] {
  return [{label: 'Markdown (.md)', onSelect: () => downloadReportNextBlob(protocol, fileName)}];
}
