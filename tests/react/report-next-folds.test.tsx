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

  return {actions, ...render(<A2uiSurface surface={surface} />)};
}

function trigger(name: string) {
  return screen.getByRole('button', {name: new RegExp(`^${name}`)});
}

/** Панель фолда остаётся в DOM (keepMounted) — свёрнутость несёт `hidden`. */
function panelOf(button: HTMLElement, container: HTMLElement) {
  return container.querySelector(`#${CSS.escape(button.getAttribute('aria-controls')!)}`)!;
}

describe('Справочные блоки отчёта — фолдом', () => {
  it('свёрнуты по умолчанию, сводка говорит что внутри', () => {
    const {container} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    // 7 чипов в двух группах, из них 4 в группе tone: 'warning'.
    expect(screen.getByText('7 значений · 4 приняты системой')).toBeTruthy();
    expect(screen.getByText('2 допущения')).toBeTruthy();

    const inputs = trigger('Исходные данные');
    expect(inputs.getAttribute('aria-expanded')).toBe('false');
    expect(panelOf(inputs, container).hasAttribute('hidden')).toBe(true);
  });

  it('раскрывается клавиатурой, и панель перестаёт быть скрытой', async () => {
    const {container} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));
    const inputs = trigger('Исходные данные');

    await act(async () => {
      inputs.focus();
      fireEvent.click(inputs);
    });

    expect(inputs.getAttribute('aria-expanded')).toBe('true');
    expect(panelOf(inputs, container).hasAttribute('hidden')).toBe(false);
    // Сводка снимается: те же значения стоят чипами внутри.
    expect(screen.queryByText('7 значений · 4 приняты системой')).toBeNull();
  });

  it('«Изменить и пересчитать» работает из свёрнутой карточки', async () => {
    const {actions} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    // Карточка не раскрывалась — действие обязано быть доступно как есть.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({name: 'report_edit_inputs', context: {}});
  });

  it('допущений нет — нет и фолда', () => {
    const {assumptions: _assumptions, ...props} = readProps('keo-report-fail.json');
    renderReport('KeoReportNext', props);

    expect(screen.queryByRole('button', {name: /^Допущения/})).toBeNull();
  });

  it('блок общий: у теплотеха тот же фолд', () => {
    const {container} = renderReport(
      'ThermalReportNext',
      readProps('thermal-report-multi.json'),
    );

    const inputs = trigger('Исходные данные');
    expect(inputs.getAttribute('aria-expanded')).toBe('false');
    expect(panelOf(inputs, container).hasAttribute('hidden')).toBe(true);
  });
});
