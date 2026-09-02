import React from 'react';
import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {SummaryCollapsible} from '../../packages/catalog-react/src/primitives/summary-collapsible';

/**
 * Ветка строкового `summary` сегодня не занята ни одним рендерером — сводку в
 * блок дефолтов лифта кладут JSX-компонентом. Поэтому она проверяется здесь
 * напрямую: иначе правило подстрочных индексов живёт в примитиве непокрытым и
 * ломается молча у первого же, кто передаст строку.
 */
function drawSummary(summary: string) {
  const {container} = render(
    <SummaryCollapsible panelId="panel" label="Параметры по умолчанию" summary={summary}>
      <span>поля</span>
    </SummaryCollapsible>,
  );

  return container;
}

describe('SummaryCollapsible: строковая сводка', () => {
  it('индекс рендерится подстрочным, подчёркивание не видно', () => {
    const container = drawSummary('t_и 90 · Δ_ст 0.4');

    expect(Array.from(container.querySelectorAll('sub')).map(node => node.textContent)).toEqual([
      'и',
      'ст',
    ]);
    expect(container.textContent).not.toContain('_');
  });

  it('сводка — один флекс-элемент, а не россыпь кусков строки', () => {
    // Шапка выложена `flex` с зазором: без обёртки каждый кусок массива стал бы
    // своим флекс-элементом и строка разъехалась бы зазорами (design, Решение 6).
    const sub = drawSummary('t_и 90').querySelector('sub')!;

    expect(sub.parentElement!.tagName).toBe('SPAN');
  });

  it('JSX-сводка проходит мимо правила', () => {
    const {container} = render(
      <SummaryCollapsible
        panelId="panel"
        label="Параметры по умолчанию"
        summary={<span>t_и 90</span>}
      >
        <span>поля</span>
      </SummaryCollapsible>,
    );

    expect(container.querySelector('sub')).toBeNull();
    expect(container.textContent).toContain('t_и 90');
  });
});
