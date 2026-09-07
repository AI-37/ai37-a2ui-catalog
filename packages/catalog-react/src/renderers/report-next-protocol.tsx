import React from 'react';
import {ReportMarkdown, ReportProtocolCard} from '../primitives';
import {ReportNextDownload} from './report-next-download';
import type {ReportNextProtocol} from './report-next.types';

/**
 * «Протокол расчёта» — строка «лейбл, мета, Скачать ⌄», раскрывающая
 * `protocol.content` разметкой: разделы, формулы и таблицы подробного расчёта.
 *
 * Свёрнут по умолчанию. Прежний канон (`reports-next`, решение 15) прятал
 * содержимое совсем — проверить расчёт до экспорта было негде; фолд возвращает
 * его на экран, не отнимая у вердикта первый экран.
 *
 * Что именно приезжает в `content` — дело агента: полный протокол или краткий
 * «Итог». Рендерер одинаково показывает и то, и другое.
 */
export function ReportNextProtocolCard({protocol}: {protocol: ReportNextProtocol | undefined}) {
  if (protocol === undefined) {
    return null;
  }

  return (
    <ReportProtocolCard
      label="Протокол расчёта"
      meta={protocol.meta}
      action={<ReportNextDownload protocol={protocol} />}
    >
      <ReportMarkdown content={protocol.content} />
    </ReportProtocolCard>
  );
}
