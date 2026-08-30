import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card} from './card';
import {CardBody} from './card-body';
import {CardTriggerLabel} from './card-trigger-label';
import {buttonClassName} from './button-class-name';
import {renderLabelSubscripts} from '../renderers/render-label-subscripts';
import type {SummaryCollapsibleProps} from './summary-collapsible.types';

/**
 * Свёрнутый блок со сводкой принятого («Параметры по умолчанию»): не слепой
 * экспандер — что внутри, видно без клика.
 *
 * Раскрытием, `aria-expanded` и клавиатурой владеет `Collapsible`; сводка
 * снимается в раскрытом виде — там те же значения стоят полями.
 */
export function SummaryCollapsible({panelId, label, summary, children}: SummaryCollapsibleProps) {
  const [open, setOpen] = React.useState(false);
  // Строковую сводку вызывающий собрал из плоской нотации; JSX-сводка
  // свёрстана им же, и трогать в ней нечего.
  const text = typeof summary === 'string' ? renderLabelSubscripts(summary) : summary;

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card flat>
        <div style={headStyle}>
          <Collapsible.Trigger
            className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
            aria-controls={panelId}
          >
            {/* Подпись не переносится: в узком контейнере она делила строку со
                сводкой поровну и рассыпалась на «Парамет / ры по / умолчан /
                ию». Место уступает сводка — она длиннее и переносится
                осмысленно. */}
            <CardTriggerLabel title={<span style={labelStyle}>{label}</span>} />
          </Collapsible.Trigger>
          {open ? null : text}
        </div>
        <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
          <CardBody>{children}</CardBody>
        </Collapsible.Panel>
      </Card>
    </Collapsible.Root>
  );
}

const labelStyle: React.CSSProperties = {whiteSpace: 'nowrap'};

const headStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: 10,
  padding: '8px 12px',
};
