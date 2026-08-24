import React from 'react';
import {Card, CardBody, CardHeader, CardTitle} from '@ai37/a2ui-catalog-react/primitives';
import {ReportActionButton} from './report-action-button';
import {ReportInputGroup} from './report-input-group';
import type {ReportInputs} from './report-assembly.types';

/** Карточка «Исходные данные»: группы пилюль по источнику значения. Одна на оба отчёта. */
export function ReportInputsCard({inputs}: {inputs: ReportInputs}) {
  return (
    <Card>
      <CardHeader
        title={<CardTitle title="Исходные данные" />}
        action={<ReportActionButton action={inputs.action} weight="link" />}
      />
      <CardBody>
        <div style={groupsStyle}>
          {inputs.groups.map((group, index) => (
            <ReportInputGroup key={`${group.label}-${index}`} group={group} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

const groupsStyle: React.CSSProperties = {display: 'grid', gap: 14};
