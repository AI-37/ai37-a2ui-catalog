import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function renderReport(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'KeoReportNext', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);

  return render(<A2uiSurface surface={processor.model.getSurface('demo-surface') as never} />);
}

function openDrawings() {
  fireEvent.click(screen.getByRole('button', {name: /Чертежи/}));
}

function sheet(container: HTMLElement, label: string) {
  return container.querySelector(`svg[aria-label="${label}"]`)!;
}

/**
 * Компактный слепок листа: чего и сколько нарисовано плюс все надписи. Целый
 * SVG в снапшот не кладётся — это ~400 узлов на проекцию, и читать такой
 * дифф при регрессии невозможно.
 */
function sheetDigest(svg: Element) {
  const counts: Record<string, number> = {};

  for (const node of Array.from(svg.querySelectorAll('*'))) {
    counts[node.tagName] = (counts[node.tagName] ?? 0) + 1;
  }

  return {counts, texts: Array.from(svg.querySelectorAll('text')).map(node => node.textContent)};
}

describe('KeoReportNext — чертежи Данилюка', () => {
  it('без drawings секции «Чертежи» нет', () => {
    const {drawings: _drawings, ...withoutDrawings} = readProps('keo-report-drawings.json');
    const {container} = renderReport(withoutDrawings);

    expect(screen.queryByText('Чертежи')).toBeNull();
    expect(container.querySelectorAll('svg[aria-label]')).toHaveLength(0);
  });

  it('фолд свёрнут по умолчанию: сводка есть, листы не смонтированы', () => {
    const {container} = renderReport(readProps('keo-report-drawings.json'));

    expect(screen.getByText('Чертежи')).toBeTruthy();
    expect(
      screen.getByText('Разрез и план · график Данилюка I/II · n₁ = 1,6, n₂ = 20,7'),
    ).toBeTruthy();
    // Решение 3 design.md: ~400 узлов на проекцию в свёрнутом отчёте не живут.
    expect(container.querySelectorAll('svg[aria-label]')).toHaveLength(0);
  });

  it('раскрытый фолд рисует обе проекции: сектор неба, n₁ и n₂', () => {
    const {container} = renderReport(readProps('keo-report-drawings.json'));
    openDrawings();

    const section = sheet(container, 'Разрез по помещению');
    const plan = sheet(container, 'План помещения');

    // Сектор видимого неба — единственный полигон разреза.
    expect(section.querySelectorAll('polygon')).toHaveLength(1);
    const sectionTexts = Array.from(section.querySelectorAll('text')).map(node => node.textContent);
    expect(sectionTexts).toContain('1,6');
    expect(sectionTexts).toContain('α = 20,0° — верх проёма');
    expect(sectionTexts).toContain('β = 13,5° — верх застройки (H = 8 м, l = 25 м)');
    expect(sectionTexts).toContain('А (РТ)');
    // Размерные в мм, отметка уровня — по ГОСТ.
    expect(sectionTexts).toContain('4400');
    expect(sectionTexts).toContain('+0,800 (УРП)');

    const planTexts = Array.from(plan.querySelectorAll('text')).map(node => node.textContent);
    expect(plan.querySelectorAll('polygon')).toHaveLength(1);
    expect(planTexts).toContain('20,7');
    expect(planTexts).toContain('1500');
  });

  it('веер графика II строится по азимутам из модели, а не по своему закону', () => {
    const props = readProps('keo-report-drawings.json');
    const drawings = structuredClone(props.drawings) as Record<string, any>;
    drawings.plan.fanRayAnglesDeg = [10, 20, 30];
    const {container} = renderReport({...props, drawings});
    openDrawings();

    const plan = sheet(container, 'План помещения');
    // Три азимута зеркалятся на обе половины веера — шесть лучей плюс
    // остальные линии листа; лучей ровно столько, сколько прислал агент.
    const rays = Array.from(plan.querySelectorAll('line')).filter(
      node => node.getAttribute('stroke-width') === '0.55',
    );
    expect(rays).toHaveLength(6);
  });

  it('окно не по центру стены: простенки и сектор едут за ним', () => {
    const props = readProps('keo-report-drawings.json');
    const drawings = structuredClone(props.drawings) as Record<string, any>;
    // Окно сдвинуто вдоль стены на 0,9 м вправо от оси расчётной точки;
    // азимуты краёв проёма считает агент — рендерер только проводит их.
    drawings.plan.window.offset = 0.9;
    drawings.plan.psi1Deg = 1.95;
    drawings.plan.psi2Deg = 20.56;
    const {container} = renderReport({...props, drawings});
    openDrawings();

    const plan = sheet(container, 'План помещения');
    const piers = Array.from(plan.querySelectorAll('rect'))
      .map(node => Number(node.getAttribute('width')))
      .filter(width => width > 0);

    // Простенки стали разной ширины — проём уехал вправо.
    expect(new Set(piers).size).toBeGreaterThan(1);

    // Сектор идёт от оси вправо: обе его дальние точки правее полюса.
    const points = plan
      .querySelector('polygon')!
      .getAttribute('points')!
      .split(' ')
      .map(pair => Number(pair.split(',')[0]));
    expect(points.slice(1).every(x => x > points[0]!)).toBe(true);
  });

  it('небо перекрыто: сектора нет, вместо n₁ — подпись', () => {
    const {container} = renderReport(readProps('keo-report-drawings-blocked.json'));

    expect(
      screen.getByText('Разрез и план · график Данилюка I/II · небо из РТ не видно, n₂ = 20,7'),
    ).toBeTruthy();

    openDrawings();
    const section = sheet(container, 'Разрез по помещению');
    const sectionTexts = Array.from(section.querySelectorAll('text')).map(node => node.textContent);

    expect(section.querySelectorAll('polygon')).toHaveLength(0);
    expect(sectionTexts).toContain('небо из РТ не видно');
    // β-луч показывает, почему неба не видно: он выше α.
    expect(sectionTexts).toContain('β = 44,3° — верх застройки (H = 30 м, l = 25 м)');
    expect(sectionTexts).not.toContain('1,6');
  });

  it('без застройки β-луча нет, сектор идёт от подоконника', () => {
    const props = readProps('keo-report-drawings.json');
    const drawings = structuredClone(props.drawings) as Record<string, any>;
    delete drawings.section.betaDeg;
    delete drawings.section.opposing;
    const {container} = renderReport({...props, drawings});
    openDrawings();

    const section = sheet(container, 'Разрез по помещению');
    const sectionTexts = Array.from(section.querySelectorAll('text')).map(node => node.textContent);

    expect(section.querySelectorAll('polygon')).toHaveLength(1);
    expect(sectionTexts.some(text => text!.startsWith('β'))).toBe(false);
    expect(sectionTexts).toContain('α = 20,0° — верх проёма');
  });

  it('слепок обеих проекций', () => {
    const visible = renderReport(readProps('keo-report-drawings.json'));
    openDrawings();
    expect(sheetDigest(sheet(visible.container, 'Разрез по помещению'))).toMatchSnapshot(
      'разрез — небо видно',
    );
    expect(sheetDigest(sheet(visible.container, 'План помещения'))).toMatchSnapshot('план');
    visible.unmount();

    const blocked = renderReport(readProps('keo-report-drawings-blocked.json'));
    openDrawings();
    expect(sheetDigest(sheet(blocked.container, 'Разрез по помещению'))).toMatchSnapshot(
      'разрез — небо перекрыто',
    );
  });
});
