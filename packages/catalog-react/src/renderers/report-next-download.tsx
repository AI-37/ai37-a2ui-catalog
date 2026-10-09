import React from 'react';
import {Menu, type MenuItem} from '../primitives';
import {reportNextBlobItems} from './report-next-blob-items';
import {reportNextUrlItems} from './report-next-url-items';
import type {ReportNextProtocol} from './report-next.types';
import {saveToProjectLabel} from './save-to-project-label';
import {useReportSaveToProject} from './use-report-save-to-project';
import type {SaveToProject} from './use-save-to-project';

/**
 * «Скачать ⌄» в строке протокола. Вид один на оба отчёта: триггер рамкой в
 * акцентном тоне, меню растёт вверх (`side="top"`) — протокол стоит последней
 * карточкой отчёта, и список вниз вылезает за нижний край сообщения.
 * Различается только список форматов: при ручке агента — `.md` и `.docx`,
 * при протоколе текстом в props — один `.md` клиентским Blob'ом. Скачивать
 * нечего — триггера нет.
 *
 * Протокол-артефакт при хосте с `onSaveToProject` получает последним пунктом
 * «Сохранить в проект»; после успеха пункт становится неактивным «В проекте».
 */
export function ReportNextDownload({protocol}: {protocol: ReportNextProtocol}) {
  const save = useReportSaveToProject(protocol.downloadUrl);

  if (protocol.downloadUrl !== undefined) {
    const items = [...reportNextUrlItems(protocol.downloadUrl), ...saveItems(save)];
    return <Menu label="Скачать" side="top" items={items} />;
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

function saveItems(save: SaveToProject): MenuItem[] {
  if (!save.canSave) return [];
  return [
    {
      label: saveToProjectLabel(save.state),
      onSelect: save.save,
      disabled: save.state === 'saving' || save.state === 'saved',
      // Статус сохранения виден в самом пункте, поэтому меню остаётся открытым.
      keepOpen: true,
    },
  ];
}
