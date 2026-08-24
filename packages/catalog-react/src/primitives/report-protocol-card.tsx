import React from 'react';
import {Card} from './card';
import {ReportProtocolMeta} from './report-protocol-meta';
import type {ReportProtocolCardProps} from './report-protocol-card.types';

/**
 * Карточка протокола — одна строка: лейбл, мета и действие. Не раскрывается:
 * краткий вывод в чате никто не читает построчно, а полная простыня всё равно
 * уезжает файлом. Шеврона нет — он обещал бы содержимое, ради которого строку
 * не открывают.
 */
export function ReportProtocolCard({label, meta, action}: ReportProtocolCardProps) {
  return (
    <Card>
      <div className="a2ui-protocol">
        <span className="a2ui-t--body a2ui-t--strong">{label}</span>
        <ReportProtocolMeta meta={meta} />
        <span className="a2ui-protocol__action">{action}</span>
      </div>
    </Card>
  );
}
