import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card} from './card';
import {CardBody} from './card-body';
import {CardTriggerLabel} from './card-trigger-label';
import {ReportProtocolMeta} from './report-protocol-meta';
import {buttonClassName} from './button-class-name';
import type {ReportProtocolCardProps} from './report-protocol-card.types';

/**
 * Карточка протокола: строка «лейбл — мета — действие», раскрывающая подробный
 * расчёт. Свёрнута по умолчанию — вердикт, ради которого карточку и открывают,
 * обязан оставаться первым экраном (тот же канон, что у «Исходных данных»).
 *
 * Панель остаётся в DOM (`keepMounted`): `aria-controls` тогда валиден всегда,
 * а разметка протокола не пересобирается на каждое раскрытие.
 *
 * Мета и действие стоят СНАРУЖИ триггера, а не внутри: внутри они попали бы в
 * доступное имя кнопки («Протокол расчёта Формулы ГОСТ… 26 шагов Скачать»), а
 * клик по меню форматов заодно переключал бы раскрытие.
 *
 * Без `children` — прежняя строка без шеврона: раскрывать нечего.
 */
export function ReportProtocolCard({label, meta, action, children}: ReportProtocolCardProps) {
  const [open, setOpen] = React.useState(false);
  const panelId = `${React.useId()}-protocol`;

  const tail = (
    <>
      <ReportProtocolMeta meta={meta} />
      <span className="a2ui-protocol__action">{action}</span>
    </>
  );

  if (children === undefined) {
    return (
      <Card>
        <div className="a2ui-protocol">
          <span className="a2ui-t--body a2ui-t--strong">{label}</span>
          {tail}
        </div>
      </Card>
    );
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card>
        <div className="a2ui-protocol">
          <Collapsible.Trigger
            className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
            aria-controls={panelId}
          >
            <CardTriggerLabel title={label} />
          </Collapsible.Trigger>
          {tail}
        </div>
        <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
          <CardBody>{children}</CardBody>
        </Collapsible.Panel>
      </Card>
    </Collapsible.Root>
  );
}
