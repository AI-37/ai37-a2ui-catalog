import React from 'react';
import {Card, CardBody, CardHeader, CardTitle} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import {ReportNextInputGroup} from './report-next-input-group';
import type {ReportNextActionSink, ReportNextInputs} from './report-next.types';

/** Карточка «Исходные данные»: группы пилюль по источнику значения. Одна на оба отчёта. */
export function ReportNextInputsCard({
  inputs,
  onAction,
}: {
  inputs: ReportNextInputs;
  onAction: ReportNextActionSink;
}) {
  return (
    <Card>
      <CardHeader
        title={<CardTitle title="Исходные данные" />}
        action={<ReportNextActionButton action={inputs.action} weight="link" onAction={onAction} />}
      />
      <CardBody>
        <div style={groupsStyle}>
          {inputs.groups.map((group, index) => (
            <ReportNextInputGroup key={`${group.label}-${index}`} group={group} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

const groupsStyle: React.CSSProperties = {display: 'grid', gap: 14};
