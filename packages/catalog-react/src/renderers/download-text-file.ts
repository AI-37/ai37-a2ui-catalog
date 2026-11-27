/** Файл, собранный на клиенте: протокол отчёта, пришедший текстом в props. */
export interface TextFile {
  fileName: string;
  mimeType: string;
  text: string;
}

/**
 * Загрузчик файлов хоста. Ошибки и отказ пользователя хост показывает (или не
 * показывает) сам: рендерер только просит скачать.
 */
export type FileDownloader = (file: TextFile) => void | Promise<void>;

/**
 * Загрузчик по умолчанию — клиентский Blob и `<a download>`: агент и транспорт
 * не участвуют. В песочнице MCP App такие загрузки заблокированы, там хост
 * подменяет загрузчик (`ArtifactCardHost.downloadFile`).
 */
export function downloadTextFileAsBlob(file: TextFile): void {
  const blob = new Blob([file.text], {type: `${file.mimeType};charset=utf-8`});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.fileName;
  link.click();
  URL.revokeObjectURL(url);
}
