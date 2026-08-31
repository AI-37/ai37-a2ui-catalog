import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card, CardBody, CardHeader} from '../primitives';
import {ReportNextActionButton} from './report-next-action-button';
import {ReportNextFoldTrigger} from './report-next-fold-trigger';
import {ReportNextInputGroup} from './report-next-input-group';
import {buildReportInputsSummary} from './build-report-inputs-summary';
import type {ReportNextActionSink, ReportNextInputs} from './report-next.types';

/**
 * Карточка «Исходные данные»: группы пилюль по источнику значения. Одна на все
 * три отчёта.
 *
 * Свёрнута по умолчанию (change `next-report-folds`): на живом наполнении
 * агента это 26 значений в четырёх группах — справка, из-за которой вердикт
 * уезжал вверх. Панель остаётся в DOM (`keepMounted`) — узлов здесь десятки, а
 * не сотни, как у чертежей, и `aria-controls` при этом валиден всегда.
 *
 * Действие «Изменить и пересчитать» стоит в шапке РЯДОМ с триггером и в
 * свёрнутом виде: спрятать единственный путь в редактор за раскрытие — значит
 * спрятать его вовсе.
 */
export function ReportNextInputsCard({
  inputs,
  onAction,
}: {
  inputs: ReportNextInputs;
  onAction: ReportNextActionSink;
}) {
  const [open, setOpen] = React.useState(false);
  const panelId = `${React.useId()}-inputs`;

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader
          title={
            <ReportNextFoldTrigger
              panelId={panelId}
              label="Исходные данные"
              summary={buildReportInputsSummary(inputs)}
              open={open}
            />
          }
          action={
            <ReportNextActionButton action={inputs.action} weight="link" onAction={onAction} />
          }
        />
        <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
          <CardBody>
            <div style={groupsStyle}>
              {inputs.groups.map((group, index) => (
                <ReportNextInputGroup key={`${group.label}-${index}`} group={group} />
              ))}
            </div>
          </CardBody>
        </Collapsible.Panel>
      </Card>
    </Collapsible.Root>
  );
}

const groupsStyle: React.CSSProperties = {display: 'grid', gap: 14};
