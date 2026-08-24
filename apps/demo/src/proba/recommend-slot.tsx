import React from 'react';
import {RecommendPreview} from './recommend-preview';

/**
 * Блок подбора стоит после ветки 52941: стаб-варианты собраны под её здание
 * (17 этажей, 340 жильцов), и у методики 34758 подбор другой.
 */
export function RecommendSlot({branchId}: {branchId: string}) {
  if (branchId !== 'per-lift') {
    return null;
  }

  return (
    <section style={blockStyle}>
      <header style={{display: 'grid', gap: 4}}>
        <h2 style={h2Style}>Блок подбора конфигураций</h2>
        <p style={leadStyle}>
          Предварительный вид: в экране он встанет между секцией «Здание» и лифтовыми секциями.
          Состояния переключаются вручную — сети в песочнице нет.
        </p>
      </header>
      <RecommendPreview />
    </section>
  );
}

const blockStyle: React.CSSProperties = {display: 'grid', gap: 12};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};

const leadStyle: React.CSSProperties = {margin: 0, fontSize: 13, color: '#64748b'};
