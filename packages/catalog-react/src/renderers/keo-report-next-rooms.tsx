import React from 'react';
import type {KeoReportRoom} from '@ai37/a2ui-catalog-schemas';
import {ReportRow} from '../primitives';
import {KeoReportNextRoomSide} from './keo-report-next-room-side';
import {ReportNextSection} from './report-next-section';
import type {ReportNextActionSink} from './report-next.types';

/**
 * «Помещения» — мультипомещенный расчёт: значение против нормы построчно.
 * Значения приходят готовыми строками: запятую, «%» и округление делает
 * агент, рендерер их не форматирует.
 */
export function KeoReportNextRooms({
  rooms,
  onAction,
}: {
  rooms: KeoReportRoom[] | undefined;
  onAction: ReportNextActionSink;
}) {
  if (rooms === undefined) {
    return null;
  }

  return (
    <ReportNextSection label="Помещения">
      {rooms.map(room => (
        <ReportRow
          key={room.id}
          title={room.name}
          detail={`норма ${room.norm}`}
          side={<KeoReportNextRoomSide room={room} onAction={onAction} />}
        />
      ))}
    </ReportNextSection>
  );
}
