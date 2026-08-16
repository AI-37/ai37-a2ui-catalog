import React from 'react';
import type {
  ThermalReportConstruction,
  ThermalReportExcluded,
} from '@ai37/a2ui-catalog-schemas';
import {formatDeviationPct} from './format-deviation-pct';
import {ThermalReportActionButton} from './thermal-report-action-button';
import type {ThermalReportOnAction} from './thermal-report.types';

/** Блок «КОНСТРУКЦИИ» (режим списка): отклонение чипом по знаку
 * `deviationPct`, «Подобрать» у непроходящих, строка исключённых в конце. */
export function ThermalReportConstructionsSection({
  constructions,
  excluded,
  onAction,
}: {
  constructions: ThermalReportConstruction[];
  excluded: ThermalReportExcluded | undefined;
  onAction: ThermalReportOnAction;
}) {
  return (
    <section className="a2ui-tr__section">
      <p className="a2ui-tr__list-label">Конструкции</p>
      <div className="a2ui-tr__rows">
        {constructions.map(construction => (
          <div key={construction.id} className="a2ui-tr__row">
            <div className="a2ui-tr__row-main">
              <span className="a2ui-tr__row-title">{construction.name}</span>
              <span className="a2ui-tr__row-detail">{construction.detail}</span>
            </div>
            <span className="a2ui-tr__row-side">
              {construction.deviationPct !== undefined ? (
                <span
                  className={`a2ui-tr__deviation a2ui-tr__deviation--${
                    construction.deviationPct < 0 ? 'fail' : 'pass'
                  }`}
                >
                  <span className="a2ui-tr__dot" aria-hidden="true" />
                  {formatDeviationPct(construction.deviationPct)}
                </span>
              ) : null}
              {construction.action ? (
                <ThermalReportActionButton
                  action={construction.action}
                  variant="solid"
                  onAction={onAction}
                />
              ) : null}
            </span>
          </div>
        ))}
        {excluded ? (
          <div className="a2ui-tr__row">
            <div className="a2ui-tr__row-main">
              <span className="a2ui-tr__row-title">{excluded.title}</span>
              {excluded.detail ? (
                <span className="a2ui-tr__row-detail">{excluded.detail}</span>
              ) : null}
            </div>
            {excluded.action ? (
              <ThermalReportActionButton
                action={excluded.action}
                variant="link"
                onAction={onAction}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
