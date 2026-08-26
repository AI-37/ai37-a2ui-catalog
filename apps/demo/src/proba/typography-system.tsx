import React from 'react';
import {KitStyles} from '@ai37/a2ui-catalog-react/primitives';
import {TYPE_MODIFIERS, TYPE_PROPOSAL} from './type-inventory';
import {TEXT_COLORS} from './text-color-inventory';

/** Готовая типографика: три ступени, два модификатора, семь цветов. */
export function TypographySystem() {
  return (
    <section className="a2ui-kit" style={sectionStyle}>
      <KitStyles />

      <h2 style={h2Style}>Типографика</h2>

      <div style={listStyle}>
        {[...TYPE_PROPOSAL, ...TYPE_MODIFIERS].map(step => (
          <div key={step.token} style={rowStyle}>
            <div style={metaStyle}>
              <code style={tokenStyle}>{step.token}</code>
              <span style={dimStyle}>{step.metrics}</span>
            </div>
            <p style={{...step.sample, margin: 0}}>{step.text}</p>
          </div>
        ))}
      </div>

      <div style={swatchGridStyle}>
        {TEXT_COLORS.map(color => (
          <div key={color.token} style={swatchStyle}>
            <span
              className={`a2ui-t--body ${color.className}`}
              style={color.onFill ? onFillStyle : undefined}
            >
              Аа
            </span>
            <code style={tokenStyle}>{color.token.replace('--a2ui-text-color', '') || '—'}</code>
            <span style={dimStyle}>{color.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: 24,
  borderRadius: 16,
  border: '1px solid light-dark(rgba(15, 23, 42, 0.1), rgba(237, 237, 234, 0.14))',
  background: 'light-dark(#ffffff, #1c1c1b)',
};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: 'light-dark(#0f172a, #ededea)'};

const listStyle: React.CSSProperties = {display: 'grid', gap: 2};

/* Колонка меты фиксирована: образцы разного кегля должны начинаться от одной
   вертикали, иначе шкала не читается как шкала. */
const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(150px, 190px) 1fr',
  gap: 16,
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: 10,
};

const metaStyle: React.CSSProperties = {display: 'grid', gap: 2, minWidth: 0};
const tokenStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'ui-monospace, monospace',
  color: 'light-dark(#1d4ed8, #7cb0de)',
  wordBreak: 'break-all',
};
const dimStyle: React.CSSProperties = {fontSize: 11, color: 'light-dark(#94a3b8, #8a8a85)'};

const swatchGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
  gap: 8,
};

const swatchStyle: React.CSSProperties = {
  display: 'grid',
  gap: 2,
  justifyItems: 'start',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'light-dark(#f8fafc, #141413)',
};

/* Светлый текст читается только на заливке. */
const onFillStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 6,
  background: 'light-dark(#1f1f1e, #ededea)',
};
