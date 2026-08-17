import React from 'react';
import type {LiftReportInputs} from '@ai37/a2ui-catalog-schemas';
import {LiftReportActionButton} from './lift-report-action-button';
import type {LiftReportOnAction} from './lift-report.types';

/** Карточка «Исходные данные»: группы чипов по источнику значения (канон
 * `ThermalReport`). `tone: 'warning'` («принято системой — проверьте») —
 * пунктирные чипы, предупреждающий заголовок и note под чипами. */
export function LiftReportInputsCard({
  inputs,
  onAction,
}: {
  inputs: LiftReportInputs;
  onAction: LiftReportOnAction;
}) {
  return (
    <div className="a2ui-lr__card">
      <div className="a2ui-lr__inputs-head">
        <span className="a2ui-lr__inputs-title">Исходные данные</span>
        {inputs.action ? (
          <LiftReportActionButton action={inputs.action} variant="link" onAction={onAction} />
        ) : null}
      </div>
      <div className="a2ui-lr__section">
        {inputs.groups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className={`a2ui-lr__group${group.tone === 'warning' ? ' a2ui-lr__group--warning' : ''}`}
          >
            <p className="a2ui-lr__group-label">{group.label}</p>
            <div className="a2ui-lr__chips">
              {group.chips.map((chip, chipIndex) => (
                <span key={`${chip.label}-${chipIndex}`} className="a2ui-lr__chip">
                  <span className="a2ui-lr__chip-label">{chip.label}</span>
                  <span className="a2ui-lr__chip-value">{chip.value}</span>
                </span>
              ))}
            </div>
            {group.note ? (
              <div className="a2ui-lr__note">
                <span className="a2ui-lr__note-dot" aria-hidden="true" />
                <span>{group.note}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
