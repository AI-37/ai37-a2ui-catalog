import {protocolTextFile, type TextProtocol} from './protocol-text-file';
import {useFileDownloader} from './use-file-downloader';

/**
 * Обработчик «Скачать» у протокола текстом для однокнопочных отчётов (теплотех,
 * КЕО, инсоляция). `undefined` — кнопки нет: нет имени файла или хост
 * скачивать не умеет.
 */
export function useProtocolDownload(protocol: TextProtocol): (() => void) | undefined {
  const download = useFileDownloader();
  const fileName = protocol.downloadFileName;
  if (download === null || fileName === undefined) return undefined;
  return () => void download(protocolTextFile(protocol, fileName));
}
