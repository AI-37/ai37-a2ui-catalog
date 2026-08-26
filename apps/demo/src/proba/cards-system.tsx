import React from 'react';
import {Button, Card, CardBody, CardHeader, CardTitle, Chip, CloseIcon, KitStyles} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/** Готовая карточка: уровни, тон, модификаторы, шапка со слотами. */
export function CardsSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading title="Карточка" axes="tone · flat · invalid" />

      <div style={gridStyle}>
        <Cell label="вложенность">
          <Card>
            <div style={{padding: 12, display: 'grid', gap: 8}}>
              <span className="a2ui-t--sub a2ui-t--muted">уровень 1 · surface · r14</span>
              <Card>
                <div style={{padding: 12, display: 'grid', gap: 8}}>
                  <span className="a2ui-t--sub a2ui-t--muted">уровень 2 · sunken · r10</span>
                  <Card>
                    <div style={{padding: 12}}>
                      <span className="a2ui-t--sub a2ui-t--muted">уровень 3 · снова светлый</span>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>
          </Card>
        </Cell>

        {/* Кликабельная целиком — только там, где в шапке нет своих кнопок:
            кнопка внутри кнопки невалидна. Со слотом «Показать» карточка
            остаётся секцией, а кликом владеет заголовок-раскрывашка. */}
        <Cell label="flat · кликабельная">
          <Card tone="sunken" flat onClick={() => undefined}>
            <CardHeader title={<CardTitle title="Условия расчёта" />} />
          </Card>
        </Cell>

        <Cell label="invalid">
          <Card tone="sunken" invalid>
            <CardHeader
              title={<CardTitle title="Стена из распознавания" />}
              badge={<Chip tone="danger">Rпр 0.16 &lt; 3.19</Chip>}
              action={<Button variant="link" icon={<CloseIcon />} aria-label="Удалить" />}
            />
          </Card>
        </Cell>

        <Cell label="шапка и тело">
          <Card tone="sunken">
            <CardHeader
              title={<CardTitle title="Наружная стена (кирпич + минвата)" />}
              badge={<Chip tone="success">Rпр 4.09 ≥ 3.19</Chip>}
            />
            <CardBody>
              <Card>
                <div style={{padding: '8px 12px'}}>
                  <span className="a2ui-t--body">Кладка из глиняного кирпича</span>
                </div>
              </Card>
            </CardBody>
          </Card>
        </Cell>
      </div>
    </section>
  );
}

/** Ячейка матрицы: имя оси сверху, образец под ней. */
function Cell({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div style={cellStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">{label}</span>
      {children}
    </div>
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
