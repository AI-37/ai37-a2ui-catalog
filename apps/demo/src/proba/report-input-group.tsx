import React from 'react';
import type {ThermalReportInputGroup} from '@ai37/a2ui-catalog-schemas';
import {DataChip} from './data-chip';
import {ReportGroupNote} from './report-group-note';

/**
 * Группа исходных данных: подпись источника и пилюли значений.
 * `tone: 'warning'` («принято системой — проверьте») красит подпись
 * предупреждением и делает рамки пилюль пунктирными — принятое системой
 * видно раньше, чем прочитана подпись.
 */
export function ReportInputGroup({group}: {group: ThermalReportInputGroup}) {
  const warning = group.tone === 'warning';

  return (
    <div style={groupStyle}>
      <span
        className={`a2ui-t--sub a2ui-t--overline ${warning ? 'a2ui-t--warning' : 'a2ui-t--muted'}`}
      >
        {group.label}
      </span>
      <div style={chipsStyle}>
        {group.chips.map((chip, index) => (
          <DataChip
            key={`${chip.label}-${index}`}
            label={chip.label}
            value={chip.value}
            dashed={warning}
          />
        ))}
      </div>
      <ReportGroupNote note={group.note} />
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};
const chipsStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
