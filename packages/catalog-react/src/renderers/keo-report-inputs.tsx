import React from 'react';
import type {KeoReportInputs} from '@ai37/a2ui-catalog-schemas';
import {KeoReportActionButton} from './keo-report-action-button';
import type {KeoReportOnAction} from './keo-report.types';

/** Карточка «Исходные данные»: группы чипов по источнику значения.
 * `tone: 'warning'` («принято системой — проверьте») — пунктирные чипы,
 * предупреждающий заголовок и note под чипами (канон ThermalReport). */
export function KeoReportInputsCard({
  inputs,
  onAction,
}: {
  inputs: KeoReportInputs;
  onAction: KeoReportOnAction;
}) {
  return (
    <div className="a2ui-kr__card">
      <div className="a2ui-kr__inputs-head">
        <span className="a2ui-kr__inputs-title">Исходные данные</span>
        {inputs.action ? (
          <KeoReportActionButton action={inputs.action} variant="link" onAction={onAction} />
        ) : null}
      </div>
      <div className="a2ui-kr__section">
        {inputs.groups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className={`a2ui-kr__group${group.tone === 'warning' ? ' a2ui-kr__group--warning' : ''}`}
          >
            <p className="a2ui-kr__group-label">{group.label}</p>
            <div className="a2ui-kr__chips">
              {group.chips.map((chip, chipIndex) => (
                <span key={`${chip.label}-${chipIndex}`} className="a2ui-kr__chip">
                  <span className="a2ui-kr__chip-label">{chip.label}</span>
                  <span className="a2ui-kr__chip-value">{chip.value}</span>
                </span>
              ))}
            </div>
            {group.note ? (
              <div className="a2ui-kr__note">
                <span className="a2ui-kr__note-dot" aria-hidden="true" />
                <span>{group.note}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
