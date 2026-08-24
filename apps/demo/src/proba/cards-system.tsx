import React from 'react';
import {Card} from './proposed-card';
import {CardHeader} from './proposed-card-header';
import {CardBody} from './proposed-card-body';
import {Chip} from './proba-chip';
import {ProposedButton} from './proposed-button';
import {CloseIcon} from './proba-icons';
import {PROPOSED_CARD_CSS} from './proposed-card-css';
import {PROBA_CHIP_CSS} from './proba-chip-css';
import {PROBA_TYPOGRAPHY_CSS} from './proba-typography-css';
import {PROPOSED_BUTTON_CSS} from './proposed-button-css';

/** Готовая карточка: уровни, тон, модификаторы, шапка со слотами. */
export function CardsSystem() {
  return (
    <section className="a2ui-proba" style={sectionStyle}>
      <style href="proba-typography" precedence="default">{PROBA_TYPOGRAPHY_CSS}</style>
      <style href="proba-proposed-button" precedence="default">{PROPOSED_BUTTON_CSS}</style>
      <style href="proba-proposed-card" precedence="default">{PROPOSED_CARD_CSS}</style>
      <style href="proba-chip" precedence="default">{PROBA_CHIP_CSS}</style>

      <h2 style={h2Style}>
        Карточка <code style={codeStyle}>tone · flat · invalid</code>
      </h2>

      <div style={gridStyle}>
        <Cell label="вложенность">
          <Card>
            <div style={{padding: 12, display: 'grid', gap: 8}}>
              <span className="a2ui-t--sub a2ui-t--muted">уровень 1 · surface · r14</span>
              <Card>
                <div style={{padding: 12}}>
                  <span className="a2ui-t--sub a2ui-t--muted">уровень 2 · sunken · r10</span>
                </div>
              </Card>
            </div>
          </Card>
        </Cell>

        <Cell label="flat · кликабельная">
          <Card tone="sunken" flat onClick={() => undefined}>
            <CardHeader
              open={false}
              onToggle={() => undefined}
              title="Условия расчёта"
              action={<ProposedButton variant="link" tone="accent">Показать</ProposedButton>}
            />
          </Card>
        </Cell>

        <Cell label="invalid">
          <Card tone="sunken" invalid>
            <CardHeader
              title="Стена из распознавания"
              badge={<Chip tone="danger">Rпр 0.16 &lt; 3.19</Chip>}
              action={<ProposedButton variant="link" icon={<CloseIcon />} aria-label="Удалить" />}
            />
          </Card>
        </Cell>

        <Cell label="раскрытая">
          <Card tone="sunken">
            <CardHeader
              open
              onToggle={() => undefined}
              title="Наружная стена (кирпич + минвата)"
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

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.1)',
  background: '#ffffff',
};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};
const codeStyle: React.CSSProperties = {fontSize: 13, color: '#64748b', fontWeight: 400};

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
  background: '#f8fafc',
};
