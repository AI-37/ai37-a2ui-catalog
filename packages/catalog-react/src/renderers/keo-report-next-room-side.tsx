import React from 'react';
import type {KeoReportRoom} from '@ai37/a2ui-catalog-schemas';
import {StatusPill} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import type {ReportNextActionSink} from './report-next.types';

/**
 * Правый слот помещения: посчитанное значение пилюлей тона статуса и, если
 * агент его задал, действие. Пилюля здесь несёт число, а не слово — по нему
 * и сравнивают помещения между собой, норма стоит в `detail` строки; это то
 * же место, где у теплотеха стоит чип отклонения.
 */
export function KeoReportNextRoomSide({
  room,
  onAction,
}: {
  room: KeoReportRoom;
  onAction: ReportNextActionSink;
}) {
  return (
    <>
      <StatusPill tone={room.status}>{room.value}</StatusPill>
      <ReportNextActionButton action={room.action} weight="outline" onAction={onAction} />
    </>
  );
}
