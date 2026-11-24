import {useArtifactCardHost} from './artifact-card-host';
import {downloadTextFileAsBlob, type FileDownloader} from './download-text-file';

/**
 * Чем скачивать протокол текстом. Хост ничего не сказал — Blob-ссылкой, как
 * всегда; дал функцию — ею; сказал `null` (скачивать не умеет) — `null`, и
 * «Скачать» рендерер не показывает, чтобы не было кнопки, которая молча
 * ничего не делает.
 */
export function useFileDownloader(): FileDownloader | null {
  const {downloadFile} = useArtifactCardHost();
  return downloadFile === undefined ? downloadTextFileAsBlob : downloadFile;
}
