import React from 'react';
import {LIFT_BRANCHES} from './lift-assembly-fixture';
import {LiftAssembly} from './lift-assembly';
import {ProbaShell} from './proba-shell';
import {RecommendSlot} from './recommend-slot';

/**
 * `/proba/lift-assembly` — экран подбора лифтов на новых примитивах в двух
 * наполнениях. Ветки стоят рядом на одной странице: ценность экрана в
 * переключении методики, и разведи их по двум адресам — сравнивать станет
 * нечего. Переключатель внутри каждой при этом рабочий.
 */
export function LiftAssemblyPage() {
  return (
    <ProbaShell
      route="/proba/lift-assembly"
      eyebrow="AI37 A2UI CATALOG"
      title="Лифты"
      lead="Экран LiftEditor из готовых примитивов: две методики, у каждой свой состав формы."
    >
      {LIFT_BRANCHES.map(branch => (
        <section key={branch.id} style={blockStyle}>
          <header style={{display: 'grid', gap: 4}}>
            <h2 style={h2Style}>{branch.title}</h2>
            <p style={leadStyle}>{branch.lead}</p>
          </header>
          <LiftAssembly branch={branch} />
          <RecommendSlot branchId={branch.id} />
        </section>
      ))}
    </ProbaShell>
  );
}

const blockStyle: React.CSSProperties = {display: 'grid', gap: 12};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};

const leadStyle: React.CSSProperties = {margin: 0, fontSize: 13, color: '#64748b'};
