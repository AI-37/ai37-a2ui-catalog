import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import type {VerificationReportCheck} from '@ai37/a2ui-catalog-schemas';
import {
  buttonClassName,
  CardBody,
  CardHeader,
  cardClassName,
  ChevronIcon,
} from '../primitives';
import {VerificationReportCheckHeading} from './verification-report-check-heading';
import {VerificationReportCheckPanel} from './verification-report-check-panel';
import {VerificationReportCheckStatus} from './verification-report-check-status';

interface CheckRowProps {
  check: VerificationReportCheck;
  value: string;
  panelId: string;
}

/**
 * Строка проверки. Раскрывается, только когда есть что показать: строка без
 * деталей и источников — не кнопка, иначе шеврон обещал бы пустую панель.
 * Обе ветки — одна раскладка (карточка, шапка, заголовок в две строки,
 * пилюля справа), у плоской на месте шеврона пустое место той же ширины.
 */
export function VerificationReportCheckRow({check, value, panelId}: CheckRowProps) {
  if (check.details === undefined && check.sources === undefined) {
    return <VerificationReportFlatRow check={check} />;
  }

  return <VerificationReportExpandableRow check={check} value={value} panelId={panelId} />;
}

/**
 * Раскрываемая строка — элемент `Accordion` с теми же классами, что у
 * `SectionItem`: раскрытием, `aria-expanded` и клавиатурой владеет
 * библиотека. Пилюля стоит рядом с `Accordion.Header`, а не внутри — иначе
 * статус попал бы в доступное имя кнопки.
 */
function VerificationReportExpandableRow({check, value, panelId}: CheckRowProps) {
  return (
    <Accordion.Item value={value} className={cardClassName()}>
      <CardHeader
        title={
          <Accordion.Header className="a2ui-card__heading">
            <Accordion.Trigger
              className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
              aria-controls={panelId}
            >
              <ChevronIcon />
              <VerificationReportCheckHeading label={check.label} summary={check.summary} />
            </Accordion.Trigger>
          </Accordion.Header>
        }
        badge={<VerificationReportCheckStatus status={check.status} />}
      />
      <Accordion.Panel keepMounted id={panelId} className="a2ui-card__panel">
        <CardBody>
          <VerificationReportCheckPanel details={check.details} sources={check.sources} />
        </CardBody>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

function VerificationReportFlatRow({check}: {check: VerificationReportCheck}) {
  return (
    <section className={cardClassName()}>
      <CardHeader
        title={
          <div className="a2ui-card__heading">
            <span className="a2ui-card__title">
              <span style={chevronSlotStyle} aria-hidden="true" />
              <VerificationReportCheckHeading label={check.label} summary={check.summary} />
            </span>
          </div>
        }
        badge={<VerificationReportCheckStatus status={check.status} />}
      />
    </section>
  );
}

/* Ширина шеврона (`.a2ui-chevron` — 1em): названия всех строк в одну линию. */
const chevronSlotStyle: React.CSSProperties = {flex: 'none', width: '1em'};
