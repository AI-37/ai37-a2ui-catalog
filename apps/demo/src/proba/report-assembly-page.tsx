import React from 'react';
import {ProbaShell} from './proba-shell';
import {ReportBlock} from './report-block';
import {REPORT_BLOCKS} from './report-assembly-fixture';

/**
 * `/proba/report-assembly` — пять наполнений трёх отчётов на новых
 * примитивах, одно под другим.
 * Переключателя здесь нет намеренно: отчёты read-mostly, и ценность страницы в
 * том, чтобы видеть их одновременно. Расхождение «протокол строкой против
 * `<details>`» существует только между двумя экранами — спрячь один за
 * переключатель, и смотреть станет не на что.
 */
export function ReportAssemblyPage() {
  return (
    <ProbaShell
      route="/proba/report-assembly"
      eyebrow="AI37 A2UI CATALOG"
      title="Отчёты"
      lead="ThermalReport в двух режимах, LiftReport и KeoReport в двух режимах из готовых примитивов: у пяти экранов одна шапка, одна строка списка и один протокол."
    >
      {REPORT_BLOCKS.map(block => (
        <section key={block.id} style={blockStyle}>
          <header style={{display: 'grid', gap: 4}}>
            <h2 style={h2Style}>{block.title}</h2>
            <p style={leadStyle}>{block.lead}</p>
          </header>
          <ReportBlock block={block} />
        </section>
      ))}
    </ProbaShell>
  );
}

const blockStyle: React.CSSProperties = {display: 'grid', gap: 12};

const h2Style: React.CSSProperties = {margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a'};

const leadStyle: React.CSSProperties = {margin: 0, fontSize: 13, color: '#64748b'};
