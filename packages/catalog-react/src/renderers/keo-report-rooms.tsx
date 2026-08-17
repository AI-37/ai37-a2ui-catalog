import React from 'react';
import type {KeoReportRoom} from '@ai37/a2ui-catalog-schemas';
import {KeoReportActionButton} from './keo-report-action-button';
import type {KeoReportOnAction} from './keo-report.types';

/**
 * Секция «Помещения» (мультипомещенный расчёт): расчётное значение против
 * нормы со статусной точкой. Значения — готовые строки: запятую, «%» и
 * округление делает агент.
 */
export function KeoReportRoomsSection({
  rooms,
  onAction,
}: {
  rooms: KeoReportRoom[];
  onAction: KeoReportOnAction;
}) {
  return (
    <section className="a2ui-kr__section">
      <p className="a2ui-kr__list-label">Помещения</p>
      <div className="a2ui-kr__rows">
        {rooms.map(room => (
          <div key={room.id} className="a2ui-kr__row">
            <div className="a2ui-kr__row-main">
              <span className="a2ui-kr__row-title">{room.name}</span>
              <span className="a2ui-kr__row-detail">норма {room.norm}</span>
            </div>
            <span className="a2ui-kr__row-side">
              <span className={`a2ui-kr__status a2ui-kr__status--${room.status}`}>
                <span className="a2ui-kr__dot" aria-hidden="true" />
                {room.value}
              </span>
              {room.action ? (
                <KeoReportActionButton action={room.action} variant="solid" onAction={onAction} />
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
