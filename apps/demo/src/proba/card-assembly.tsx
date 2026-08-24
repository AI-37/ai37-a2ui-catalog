import React from 'react';
import {CONSTRUCTIONS} from './assembly-fixture';
import {ConditionsGroup} from './conditions-group';
import {ConstructionCard} from './construction-card';
import {Card} from './proposed-card';
import {ProposedButton} from './proposed-button';
import {PlusIcon} from './proba-icons';
import {PROBA_TYPOGRAPHY_CSS} from './proba-typography-css';
import {PROPOSED_BUTTON_CSS} from './proposed-button-css';
import {PROPOSED_CARD_CSS} from './proposed-card-css';
import {PROBA_CHIP_CSS} from './proba-chip-css';
import {PROBA_FORM_CSS} from './proba-form-css';

/** Экран `ConstructionsEditor`, собранный из готовых примитивов. Чего нет на экране — нет и здесь. */
export function CardAssembly() {
  const [conditionsOpen, setConditionsOpen] = React.useState(false);
  // Раскрыта одна карточка за раз — как в редакторе: список из четырёх
  // открытых составов перестаёт читаться.
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <section className="a2ui-proba" style={frameStyle}>
      <style href="proba-typography" precedence="default">{PROBA_TYPOGRAPHY_CSS}</style>
      <style href="proba-proposed-button" precedence="default">{PROPOSED_BUTTON_CSS}</style>
      <style href="proba-proposed-card" precedence="default">{PROPOSED_CARD_CSS}</style>
      <style href="proba-chip" precedence="default">{PROBA_CHIP_CSS}</style>
      <style href="proba-form" precedence="default">{PROBA_FORM_CSS}</style>

      <Card>
        <div style={bodyStyle}>
          <ConditionsGroup
            open={conditionsOpen}
            onToggle={() => setConditionsOpen(prev => !prev)}
          />

          <div style={groupStyle}>
            <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
              Конструкции · {CONSTRUCTIONS.length}
            </span>
            {CONSTRUCTIONS.map(entry => (
              <ConstructionCard
                key={entry.id}
                entry={entry}
                open={openId === entry.id}
                onToggle={() => setOpenId(prev => (prev === entry.id ? null : entry.id))}
              />
            ))}
            <div style={{justifySelf: 'start'}}>
              <ProposedButton dashed icon={<PlusIcon />}>
                Добавить конструкцию
              </ProposedButton>
            </div>
          </div>

          <div style={footerStyle}>
            <ProposedButton variant="filled" size="lg">
              Далее
            </ProposedButton>
            <span className="a2ui-t--sub a2ui-t--muted">проходит 2 из 4</span>
          </div>
        </div>
      </Card>
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 18, padding: 16};

/* Кнопка «Добавить» обёрнута в justify-self: start — как прямой ребёнок grid
   она растягивалась во всю ширину группы и читалась как ещё одна карточка. */
const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
