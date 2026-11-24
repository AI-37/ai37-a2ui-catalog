import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';
import {renderProtocolMarkdown} from '../../packages/catalog-react/src/renderers/protocol-markdown';

/**
 * Протокол текстом (`downloadContent`, внешний хост MCP App) раскрывается, как
 * «Исходные данные»: под строкой весь расчёт с формулами MathML. Без полного
 * текста строка прежняя — одна, без раскрытия (чат spai-ui).
 */

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

type Props = Record<string, unknown>;

function readProps(fileName: string): Props {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Props;
}

function renderReport(component: string, props: Props) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {surfaceId: 'demo-surface', components: [{id: 'root', component, ...props}]},
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  return render(<A2uiSurface surface={processor.model.getSurface('demo-surface') as never} />);
}

const PROTOCOL = [
  '## 1. Исходные данные',
  '',
  '| Параметр | Значение |',
  '| --- | --- |',
  '| Число этажей $N$ | **17** |',
  '',
  '### А.2.6 Время кругового рейса T',
  '',
  '$$T = \\dfrac{2H_\\text{в}}{V_\\text{н}}$$',
  '',
  '- $E$ — вместимость: $E = \\left\\lfloor Q/75 \\right\\rfloor = 5$',
].join('\n');

describe('renderProtocolMarkdown', () => {
  it('markdown — в разметку, TeX — в MathML (блоком и в строке)', () => {
    const html = renderProtocolMarkdown(PROTOCOL);
    expect(html).toContain('<h2>1. Исходные данные</h2>');
    expect(html).toContain('<table>');
    expect(html).toContain('<strong>17</strong>');
    expect(html).toMatch(/<math[^>]*display="block"/);
    expect((html.match(/<math/g) ?? []).length).toBe(4);
    // Подчёркивания и звёздочки внутри TeX markdown не трогает.
    expect(html).not.toContain('<em>');
    // Ни HTML-разметки KaTeX (ей нужны стили), ни сырого TeX на экране.
    expect(html).not.toContain('katex-html');
    expect(html).not.toContain('$$');
  });

  it('сырой HTML из текста протокола экранируется', () => {
    const html = renderProtocolMarkdown('Поле <script>alert(1)</script> $x$\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('доллар без формулы (цена, «$ 5») остаётся текстом', () => {
    const html = renderProtocolMarkdown('Стоимость 5 $ и 7 $ за метр');
    expect(html).not.toContain('<math');
    expect(html).toContain('5 $ и 7 $');
  });
});

describe('ReportNextProtocolCard: раскрытие протокола', () => {
  it('с downloadContent — свёрнут, по клику весь расчёт с формулами; «Скачать» на месте', async () => {
    const props = readProps('lift-report-protocol-text.json');
    const protocol = props.protocol as {downloadContent: string};
    renderReport('LiftReportNext', {...props, protocol: {...protocol, downloadContent: PROTOCOL}});

    const trigger = screen.getByRole('button', {name: /Протокол расчёта/});
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('button', {name: /^Скачать/})).toBeTruthy();
    expect(document.querySelector('.a2ui-protocol-doc')?.innerHTML).toBe('');

    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const doc = document.querySelector('.a2ui-protocol-doc')!;
    expect(doc.querySelector('h3')?.textContent).toBe('А.2.6 Время кругового рейса T');
    expect(doc.querySelectorAll('math').length).toBe(4);
  });

  it('без downloadContent — одна строка без раскрытия, как в чате', () => {
    const props = readProps('lift-report-protocol-text.json');
    const {downloadContent: _drop, ...protocol} = props.protocol as Record<string, unknown>;
    renderReport('LiftReportNext', {...props, protocol});

    expect(screen.queryByRole('button', {name: /Протокол расчёта/})).toBeNull();
    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(document.querySelector('.a2ui-protocol-doc')).toBeNull();
  });
});
