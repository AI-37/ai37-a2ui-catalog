import type {TextFile} from './download-text-file';

/** Поля протокола, общие у отчётов с Blob-скачиванием (теплотех, КЕО, инсоляция, лифты). */
export interface TextProtocol {
  content: string;
  downloadContent?: string | undefined;
  downloadFileName?: string | undefined;
}

/**
 * Протокол как файл: полная простыня живёт в `downloadContent`, краткий вывод —
 * в `content`; на экране не показывается ни то, ни другое.
 */
export function protocolTextFile(protocol: TextProtocol, fileName: string): TextFile {
  return {
    fileName,
    mimeType: 'text/markdown',
    text: protocol.downloadContent ?? protocol.content,
  };
}
