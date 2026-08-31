import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {Collapsible} from '@base-ui/react/collapsible';
import {
  Card,
  CardBody,
  CardHeader,
  CardTriggerLabel,
  Chip,
  KitStyles,
  SectionItem,
  SummaryCollapsible,
  buttonClassName,
} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/** Три секции витрины — короткие, чтобы был виден сам механизм, а не состав. */
const ITEMS = [
  {id: 'building', title: 'Здание', summary: 'этажей 17 · квартир 204', badge: undefined},
  {id: 'lift-0', title: 'Лифт 1', summary: '', badge: 'fill' as const},
  {id: 'lift-1', title: 'Лифт 2', summary: 'Q 1000 кг · v 1.6 м/с', badge: 'review' as const},
];

/** Готовые раскрывашки: одна секция — `Collapsible`, список — `SectionItem` в `Accordion`. */
export function DisclosureSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading
        title="Раскрывашки"
        axes="Collapsible · SummaryCollapsible (сводка принятого) · SectionItem (сводка · пометка · действие)"
      />

      <div style={gridStyle}>
        <div style={cellStyle}>
          <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
            Collapsible · секция без соседей
          </span>
          <Collapsible.Root>
            <Card flat>
              <CardHeader
                title={
                  <Collapsible.Trigger
                    className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
                  >
                    <CardTriggerLabel title="Условия расчёта" />
                  </Collapsible.Trigger>
                }
              />
              <Collapsible.Panel keepMounted className="a2ui-card__panel">
                <CardBody>
                  <span className="a2ui-t--sub a2ui-t--muted">
                    Тело секции. Подложка и шапка у обоих состояний общие.
                  </span>
                </CardBody>
              </Collapsible.Panel>
            </Card>
          </Collapsible.Root>
        </div>

        {/* Свёрнутая строка со сводкой принятых значений — блок «Параметры по
            умолчанию»: принятое видно без клика, поэтому экспандер не слепой.
            В раскрытом виде сводки нет: там те же значения стоят полями. */}
        <div style={cellStyle}>
          <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
            SummaryCollapsible · свёрнутый показывает принятое
          </span>
          <SummaryCollapsible
            panelId="proba-system-advanced"
            label="Параметры по умолчанию"
            summary={<span className="a2ui-t--sub a2ui-t--muted">hf 3.3 · kп 0.8 · kт 1.05</span>}
          >
            <span className="a2ui-t--sub a2ui-t--muted">
              Поля дефолтов. Обязательное пустое поле сюда не прячется.
            </span>
          </SummaryCollapsible>
        </div>

        <div style={cellStyle}>
          <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
            SectionItem · Tab между заголовками, Enter · Space раскрывает
          </span>
          <Accordion.Root multiple={false} style={listStyle}>
            {ITEMS.map(item => (
              <SectionItem
                key={item.id}
                value={item.id}
                panelId={`proba-system-${item.id}`}
                title={item.title}
                summary={item.summary}
                badge={
                  item.badge === undefined ? undefined : (
                    <Chip tone={item.badge === 'fill' ? 'warning' : 'neutral'}>
                      {item.badge === 'fill' ? 'заполните' : 'просмотреть'}
                    </Chip>
                  )
                }
              >
                <span className="a2ui-t--sub a2ui-t--muted">Поля секции</span>
              </SectionItem>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 8,
};

const cellStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  alignContent: 'start',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'light-dark(#f8fafc, #141413)',
};

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};
