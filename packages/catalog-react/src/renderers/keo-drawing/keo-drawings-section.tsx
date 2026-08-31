import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card, CardBody, CardTriggerLabel, buttonClassName} from '../../primitives';
import {PlanDrawing} from './plan-drawing';
import {SectionDrawing} from './section-drawing';
import {buildDrawingsSummary} from './build-drawings-summary';
import {planBounds} from './plan-bounds';
import {resolveSheetScale} from './resolve-sheet-scale';
import {sectionBounds} from './section-bounds';
import type {KeoDrawings} from '@ai37/a2ui-catalog-schemas';

/**
 * Секция «Чертежи» карточки отчёта: две проекции фолдом, свёрнутым по
 * умолчанию. Лист — это ~400 узлов SVG на проекцию, поэтому панель НЕ
 * `keepMounted`: в свёрнутом отчёте чертежи не монтируются вовсе (Решение 3
 * design.md). Из-за этого `aria-controls` объявляется только раскрытым — у
 * свёрнутого триггера панели в DOM нет.
 *
 * Блок самодостаточен по пропсам: кроме `drawings`, ему из отчёта не нужно
 * ничего — потому и переносится в другой компонент как есть.
 */
export function KeoDrawingsSection({
  drawings,
  defaultOpen = false,
}: {
  drawings: KeoDrawings | undefined;
  /**
   * Раскрыть сразу. В отчёте не используется — фолд там свёрнут по
   * определению; проп нужен витрине ревизии, где листы и есть содержимое
   * страницы, а не приложение к вердикту.
   */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const panelId = `${React.useId()}-drawings`;

  if (drawings === undefined) {
    return null;
  }

  // одна цена деления на оба листа: рядом два масштаба читались бы как два
  // разных помещения
  const pxPerMeter = resolveSheetScale([sectionBounds(drawings.section), planBounds(drawings.plan)]);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Card>
        <div style={headStyle}>
          <Collapsible.Trigger
            className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
            aria-controls={open ? panelId : undefined}
          >
            <CardTriggerLabel title={<span style={labelStyle}>Чертежи</span>} />
          </Collapsible.Trigger>
          {open ? null : (
            <span className="a2ui-t--sub a2ui-t--muted">{buildDrawingsSummary(drawings)}</span>
          )}
        </div>
        <Collapsible.Panel id={panelId} className="a2ui-card__panel">
          <CardBody>
            <figure style={figureStyle}>
              <figcaption className="a2ui-t--sub a2ui-t--muted">
                Разрез по помещению · график Данилюка I
              </figcaption>
              <SectionDrawing section={drawings.section} pxPerMeter={pxPerMeter} />
            </figure>
            <figure style={figureStyle}>
              <figcaption className="a2ui-t--sub a2ui-t--muted">
                План помещения · график Данилюка II
              </figcaption>
              <PlanDrawing plan={drawings.plan} pxPerMeter={pxPerMeter} />
            </figure>
          </CardBody>
        </Collapsible.Panel>
      </Card>
    </Collapsible.Root>
  );
}

const headStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: 10,
  padding: '10px 12px',
};

const labelStyle: React.CSSProperties = {whiteSpace: 'nowrap'};

const figureStyle: React.CSSProperties = {display: 'grid', gap: 6, margin: 0, minWidth: 0};
