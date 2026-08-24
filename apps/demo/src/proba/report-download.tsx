import React from 'react';
import {blobFormatItems} from './blob-format-items';
import {downloadFormatItems} from './download-format-items';
import {ReportDownloadMenu} from './report-download-menu';
import type {ReportProtocol} from './report-assembly.types';

/**
 * «Скачать ⌄» в строке протокола. Вид один на оба отчёта, различается только
 * список форматов: при ручке агента — `.md` и `.docx`, при протоколе текстом
 * в props — один `.md` клиентским Blob'ом. Скачивать нечего — кнопки нет.
 */
export function ReportDownload({protocol}: {protocol: ReportProtocol}) {
  if (protocol.downloadUrl !== undefined) {
    return <ReportDownloadMenu items={downloadFormatItems(protocol.downloadUrl)} />;
  }

  if (protocol.downloadFileName !== undefined) {
    return <ReportDownloadMenu items={blobFormatItems(protocol, protocol.downloadFileName)} />;
  }

  return null;
}
