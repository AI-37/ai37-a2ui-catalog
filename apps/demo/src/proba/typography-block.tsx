import React from 'react';
import {TYPE_INVENTORY} from './type-inventory';
import {COLOR_CONFLICT} from './text-color-inventory';
import {TypeStepNote} from './type-step-note';

/** Ревизия типографики: девять кеглей, как они объявлены в `*-styles.ts`. */
export function TypographyBlock() {
  return (
    <section style={inventoryStyle}>
        <header style={{display: 'grid', gap: 6}}>
          <p style={eyebrowStyle}>РЕВИЗИЯ · ЧТО ЕСТЬ СЕГОДНЯ</p>
          <h2 style={{margin: 0, fontSize: 18}}>Девять кеглей, 131 объявление</h2>
          <ul style={findingsStyle}>
            <li>
              <b>Начертание разошлось по линии «редакторы против всех»</b>: <code>le / ke / ie</code>{' '}
              ставят титулам и submit'ам <code>600</code>, CE и четыре отчёта тем же ролям —{' '}
              <code>500</code>. Тот же раскол, что у кнопок.
            </li>
            <li>
              <b>Интерлиньяж записан двумя способами вперемешку</b>: 23 объявления в px
              (<code>line-height: 13px</code>) и 21 множителем (<code>1.45</code>). В px он не
              переживает смену кегля.
            </li>
            <li>
              <b><code>.a2ui-ce</code> — единственная поверхность без корневого <code>font-size</code></b>:
              всё, что не задало кегль явно, наследует его у хоста.
            </li>
          </ul>
        </header>

        <div style={{display: 'grid', gap: 8}}>
          {TYPE_INVENTORY.map(step => (
            <div key={step.size} style={stepRowStyle}>
              <div style={{display: 'grid', gap: 3, minWidth: 0}}>
                <code style={sizeStyle}>{step.size}</code>
                <span style={metricsStyle}>{step.metrics}</span>
                <span style={countStyle}>{step.declarations} объявл.</span>
              </div>
              <div style={{display: 'grid', gap: 4, minWidth: 0}}>
                <p style={{...step.sample, margin: 0, color: '#0f172a'}}>{step.text}</p>
                <span style={roleStyle}>{step.roles}</span>
                <TypeStepNote note={step.note} />
              </div>
            </div>
          ))}
        </div>

        <div style={conflictStyle}>
          <b style={{fontSize: 13}}>Основного цвета текста два, и они из разных палитр</b>
          {COLOR_CONFLICT.map(([hex, where]) => (
            <span key={hex} style={{fontSize: 12.5, color: '#334155'}}>
              <span style={{...dotStyle, background: hex}} />
              <b>{hex}</b> — {where}
            </span>
          ))}
        </div>
    </section>
  );
}

const inventoryStyle: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  padding: 24,
  borderRadius: 16,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#ffffff',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11.5,
  letterSpacing: 1.2,
  fontWeight: 600,
  color: '#b45309',
};

const findingsStyle: React.CSSProperties = {
  margin: '4px 0 0',
  paddingLeft: 18,
  display: 'grid',
  gap: 6,
  fontSize: 13.5,
  lineHeight: 1.5,
  color: '#334155',
};

/* Две колонки: слева метрики, справа образец. Ширина левой фиксирована —
   иначе строки съезжают и вертикальное сравнение кеглей ломается. */
const rowBase: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(160px, 200px) 1fr',
  gap: 16,
  alignItems: 'center',
  padding: '12px 14px',
  borderRadius: 10,
};

const stepRowStyle: React.CSSProperties = {...rowBase, background: '#f8fafc'};

const sizeStyle: React.CSSProperties = {fontSize: 14, fontWeight: 600, color: '#0f172a'};
const metricsStyle: React.CSSProperties = {fontSize: 11.5, color: '#475569'};
const countStyle: React.CSSProperties = {fontSize: 11.5, color: '#94a3b8'};
const roleStyle: React.CSSProperties = {fontSize: 11.5, color: '#94a3b8'};

const conflictStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  padding: 16,
  borderRadius: 12,
  border: '1px solid #fcd34d',
  background: '#fffbeb',
};

const dotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 10,
  height: 10,
  marginRight: 6,
  borderRadius: 3,
};
