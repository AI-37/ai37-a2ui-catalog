import type {ReportNextProtocol} from './report-next.types';

/**
 * Скачивание протокола клиентским Blob'ом: так отдаётся протокол, пришедший
 * текстом в props, — агент и транспорт не участвуют. Полная простыня живёт в
 * `downloadContent`, краткий вывод — в `content`; на экране не показывается
 * ни то, ни другое.
 */
export function downloadReportNextBlob(protocol: ReportNextProtocol, fileName: string): void {
  const blob = new Blob([protocol.downloadContent ?? protocol.content], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
