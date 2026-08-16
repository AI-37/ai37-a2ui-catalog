import React from 'react';
import type {ThermalReportInputs} from '@ai37/a2ui-catalog-schemas';
import {ThermalReportActionButton} from './thermal-report-action-button';
import type {ThermalReportOnAction} from './thermal-report.types';

/** Карточка «Исходные данные»: группы чипов по источнику значения.
 * `tone: 'warning'` («принято системой — проверьте») — пунктирные чипы,
 * предупреждающий заголовок и note под чипами. */
export function ThermalReportInputsCard({
  inputs,
  onAction,
}: {
  inputs: ThermalReportInputs;
  onAction: ThermalReportOnAction;
}) {
  return (
    <div className="a2ui-tr__card">
      <div className="a2ui-tr__inputs-head">
        <span className="a2ui-tr__inputs-title">Исходные данные</span>
        {inputs.action ? (
          <ThermalReportActionButton action={inputs.action} variant="outline" onAction={onAction} />
        ) : null}
      </div>
      <div className="a2ui-tr__section">
        {inputs.groups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className={`a2ui-tr__group${group.tone === 'warning' ? ' a2ui-tr__group--warning' : ''}`}
          >
            <p className="a2ui-tr__group-label">{group.label}</p>
            <div className="a2ui-tr__chips">
              {group.chips.map((chip, chipIndex) => (
                <span key={`${chip.label}-${chipIndex}`} className="a2ui-tr__chip">
                  <span className="a2ui-tr__chip-label">{chip.label}</span>
                  <span className="a2ui-tr__chip-value">{chip.value}</span>
                </span>
              ))}
            </div>
            {group.note ? (
              <div className="a2ui-tr__note">
                <span className="a2ui-tr__note-dot" aria-hidden="true" />
                <span>{group.note}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
