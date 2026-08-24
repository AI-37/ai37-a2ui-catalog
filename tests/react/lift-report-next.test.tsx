import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
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

function renderReport(component: string, props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component, ...props}],
      },
    },
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as any;

  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });

  const utils = render(<A2uiSurface surface={surface} />);
  return {actions, ...utils};
}

async function flush(run: () => void) {
  await act(async () => {
    run();
  });
}

describe('LiftReportNext', () => {
  it('вердикт, «Что изменить» и исходные данные', () => {
    const {container} = renderReport('LiftReportNext', readProps('lift-report.json'));

    const badge = container.querySelector('.a2ui-pill.a2ui-t--overline')!;
    expect(badge.textContent).toContain('НЕ СООТВЕТСТВУЕТ ГОСТ');
    expect(screen.getByText('Интервал движения — 220 с')).toBeTruthy();

    expect(screen.getByText('Что изменить')).toBeTruthy();
    // Акцентная рамка — только у рекомендованного варианта (tone: 'pass').
    const recommended = container.querySelectorAll('.a2ui-card--accent');
    expect(recommended).toHaveLength(1);
    expect(recommended[0]!.textContent).toContain('3 лифта в группе');

    expect(screen.getByText('Исходные данные')).toBeTruthy();
  });

  it('отправляет те же действия с тем же контекстом', async () => {
    const {actions} = renderReport('LiftReportNext', readProps('lift-report.json'));

    await flush(() => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Пересчитать'})[0]!);
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(2);
    expect(actions[0]!.name).toBe('report_apply_suggestion');
    expect(actions[0]!.context).toMatchObject({suggestionId: 'n3'});
    expect(actions[1]!.name).toBe('report_edit_inputs');
    expect(actions[1]!.context).toEqual({});
  });

  it('протокол не раскрывается: ни details, ни pre, ни текста вывода', () => {
    const props = readProps('lift-report.json');
    const {container} = renderReport('LiftReportNext', props);

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(container.querySelector('details')).toBeNull();
    expect(container.querySelector('pre')).toBeNull();

    const content = (props.protocol as {content: string}).content;
    expect(container.textContent).not.toContain(content.slice(0, 40));
  });

  it('протокол ручкой агента — два формата', async () => {
    renderReport('LiftReportNext', readProps('lift-report.json'));

    const trigger = screen.getByRole('button', {name: /^Скачать/});
    await flush(() => {
      trigger.focus();
      fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    });

    const items = screen.getAllByRole('menuitem');
    expect(items.map(item => item.textContent)).toEqual(['Markdown (.md)', 'Word (.docx)']);
  });
});

describe('Оба отчёта говорят о состоянии одинаково', () => {
  it('непроходящее печатается одним словом независимо от statusLabel', () => {
    // В фикстуре лифтов у непроходящего варианта statusLabel «не проходит»,
    // у теплотеха то же состояние названо перечислением. Канон (решение 12
    // proba-report-assembly): слово выбирает рендерер, а не агент.
    const lift = renderReport('LiftReportNext', readProps('lift-report.json'));
    // Ступень `row`: пилюля вердикта в шапке несёт тот же тон.
    const failing = lift.container.querySelector('.a2ui-pill.a2ui-t--strong.a2ui-t--danger')!;
    expect(failing.textContent).toBe('Не соответствует');
    expect(lift.container.textContent).not.toContain('не проходит');
    lift.unmount();

    const thermal = renderReport('ThermalReportNext', readProps('thermal-report-single.json'));
    const passing = thermal.container.querySelector('.a2ui-pill.a2ui-t--strong.a2ui-t--success')!;
    expect(passing.textContent).toBe('Соответствует');
  });
});
