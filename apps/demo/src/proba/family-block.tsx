import React from 'react';
import {FamilyDuplicateNote} from './family-duplicate-note';
import {FamilyStyleTag} from './family-style-tag';
import type {ButtonFamily} from './button-inventory.types';

/** Одно семейство кнопок в ревизии: живые образцы в своей корневой обёртке плюс класс и метрики. */
export function FamilyBlock({family}: {family: ButtonFamily}) {
  const Root = family.root ? 'div' : React.Fragment;
  // Корневой класс нужен только как предок для селекторов вида
  // `.a2ui-ce .a2ui-ce-btn`. Собственное оформление корня (рамка, фон, grid во
  // всю ширину) в ревизии врёт: образец растягивался и получал чужую рамку.
  // Гасим инлайном — он специфичнее класса.
  const rootProps = family.root ? {className: family.root, style: neutralRootStyle} : {};

  return (
    <section style={sectionStyle}>
      <FamilyStyleTag root={family.root} css={family.css} />

      <header style={{display: 'grid', gap: 4}}>
        <h2 style={{margin: 0, fontSize: 16, fontWeight: 600}}>{family.title}</h2>
        <code style={sourceStyle}>{family.source}</code>
        <FamilyDuplicateNote duplicateOf={family.duplicateOf} />
      </header>

      <div style={gridStyle}>
        {family.samples.map(sample => (
          <div key={`${sample.className ?? 'inline'}-${sample.label}`} style={cellStyle}>
            <div style={stageStyle}>
              <Root {...rootProps}>
                <button type="button" className={sample.className ?? undefined} style={sample.style}>
                  {sample.label}
                </button>
              </Root>
            </div>
            <code style={classStyle}>{sample.className ?? 'inline style'}</code>
            <span style={metricsStyle}>{sample.metrics}</span>
            <span style={usedInStyle}>{sample.usedIn}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  padding: 20,
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#ffffff',
};

const neutralRootStyle: React.CSSProperties = {
  display: 'inline-flex',
  width: 'auto',
  minWidth: 0,
  border: 'none',
  borderRadius: 0,
  background: 'transparent',
  overflow: 'visible',
  containerType: 'normal',
};

const sourceStyle: React.CSSProperties = {fontSize: 12, color: '#64748b'};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 12,
};

const cellStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  alignContent: 'start',
  padding: 12,
  borderRadius: 10,
  background: '#f8fafc',
};

/* Сцена под образец: фиксированная высота, чтобы разнокалиберные кнопки
   не рвали сетку и разница в кегле читалась глазом. */
const stageStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  minHeight: 44,
  marginBottom: 4,
};

const classStyle: React.CSSProperties = {fontSize: 11.5, color: '#0f172a', wordBreak: 'break-all'};
const metricsStyle: React.CSSProperties = {fontSize: 11.5, color: '#475569'};
const usedInStyle: React.CSSProperties = {fontSize: 11.5, color: '#94a3b8'};
