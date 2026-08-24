import React from 'react';
import {Menu} from '../primitives';
import {reportNextBlobItems} from './report-next-blob-items';
import {reportNextUrlItems} from './report-next-url-items';
import type {ReportNextProtocol} from './report-next.types';

/**
 * «Скачать ⌄» в строке протокола. Вид один на оба отчёта: триггер рамкой в
 * акцентном тоне, меню растёт вверх (`side="top"`) — протокол стоит последней
 * карточкой отчёта, и список вниз вылезает за нижний край сообщения.
 * Различается только список форматов: при ручке агента — `.md` и `.docx`,
 * при протоколе текстом в props — один `.md` клиентским Blob'ом. Скачивать
 * нечего — триггера нет.
 */
export function ReportNextDownload({protocol}: {protocol: ReportNextProtocol}) {
  if (protocol.downloadUrl !== undefined) {
    return <Menu label="Скачать" side="top" items={reportNextUrlItems(protocol.downloadUrl)} />;
  }

  if (protocol.downloadFileName !== undefined) {
    return (
      <Menu
        label="Скачать"
        side="top"
        items={reportNextBlobItems(protocol, protocol.downloadFileName)}
      />
    );
  }

  return null;
}
