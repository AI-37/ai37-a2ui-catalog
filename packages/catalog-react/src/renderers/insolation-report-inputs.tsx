import React from 'react';
import type {InsolationReportInputs} from '@ai37/a2ui-catalog-schemas';
import {InsolationReportActionButton} from './insolation-report-action-button';
import type {InsolationReportOnAction} from './insolation-report.types';

/** Карточка «Исходные данные»: группы чипов по источнику значения.
 * `tone: 'warning'` («принято системой — проверьте») — пунктирные чипы,
 * предупреждающий заголовок и note под чипами (канон ThermalReport). */
export function InsolationReportInputsCard({
  inputs,
  onAction,
}: {
  inputs: InsolationReportInputs;
  onAction: InsolationReportOnAction;
}) {
  return (
    <div className="a2ui-ir__card">
      <div className="a2ui-ir__inputs-head">
        <span className="a2ui-ir__inputs-title">Исходные данные</span>
        {inputs.action ? (
          <InsolationReportActionButton action={inputs.action} variant="link" onAction={onAction} />
        ) : null}
      </div>
      <div className="a2ui-ir__section">
        {inputs.groups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className={`a2ui-ir__group${group.tone === 'warning' ? ' a2ui-ir__group--warning' : ''}`}
          >
            <p className="a2ui-ir__group-label">{group.label}</p>
            <div className="a2ui-ir__chips">
              {group.chips.map((chip, chipIndex) => (
                <span key={`${chip.label}-${chipIndex}`} className="a2ui-ir__chip">
                  <span className="a2ui-ir__chip-label">{chip.label}</span>
                  <span className="a2ui-ir__chip-value">{chip.value}</span>
                </span>
              ))}
            </div>
            {group.note ? (
              <div className="a2ui-ir__note">
                <span className="a2ui-ir__note-dot" aria-hidden="true" />
                <span>{group.note}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
