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

function renderReport(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'KeoReport', ...props}],
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

describe('KeoReport', () => {
  it('renders the fail filling: verdict, recommendations by tone, protocol row', () => {
    const {container} = renderReport(readProps('keo-report-fail.json'));

    expect(screen.getByText('КЕО — 0,42 % при норме 0,50 %')).toBeTruthy();
    expect(screen.getByText('Что изменить')).toBeTruthy();
    expect(container.querySelectorAll('.a2ui-kr__card-option--success')).toHaveLength(1);
    expect(container.querySelectorAll('.a2ui-kr__card-option--neutral')).toHaveLength(1);
    // Отвергнутый вариант: detail danger-цветом и без кнопки.
    const rejected = container.querySelector('.a2ui-kr__card-option--fail')!;
    expect(rejected.textContent).toContain('Светлее отделка помещения');
    expect(rejected.querySelector('button')).toBeNull();
    // Протокол — одна строка без раскрытия: content в UI не показывается.
    expect(container.querySelector('details')).toBeNull();
    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(container.querySelector('.a2ui-kr__protocol')!.textContent).not.toContain('ε_б');
  });

  it('dispatches recommendation and inputs actions with payload', async () => {
    const {actions} = renderReport(readProps('keo-report-fail.json'));

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Пересчитать с окном 1,8 × 1,5'}));
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(2);
    expect(actions[0]!.name).toBe('report_recalc');
    expect(actions[0]!.context).toMatchObject({roomId: 'r1', window: '1.8x1.5'});
    expect(actions[1]!.name).toBe('report_edit_inputs');
  });

  it('marks system-assumed inputs group with warning tone', () => {
    const {container} = renderReport(readProps('keo-report-fail.json'));

    const warningGroup = container.querySelector('.a2ui-kr__group--warning')!;
    expect(warningGroup.textContent).toContain('Принято системой — проверьте');
    expect(warningGroup.textContent).toContain('ρ_ф фасада');
    expect(warningGroup.textContent).toContain('пол Г-0,0');
  });

  it('renders per-room results with status colours and optional actions', async () => {
    const {actions, container} = renderReport(readProps('keo-report-pass.json'));

    expect(screen.getByText('Соответствуют 2 помещения из 2')).toBeTruthy();
    expect(container.querySelectorAll('.a2ui-kr__status--pass')).toHaveLength(2);
    expect(screen.getByText('0,52 %')).toBeTruthy();
    expect(screen.getAllByText('норма 0,50 %')).toHaveLength(2);
    // Кнопка — только у второго помещения (у первого action не задан).
    expect(screen.getAllByRole('button', {name: 'Пересчитать'})).toHaveLength(1);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Пересчитать'}));
    });

    expect(actions[0]!.context).toMatchObject({roomId: 'r2'});
  });

  it('downloads the protocol as a client-side blob', () => {
    const created: string[] = [];
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob: Blob) => {
      created.push(blob.type);
      return 'blob:demo';
    };
    URL.revokeObjectURL = () => {};

    try {
      renderReport(readProps('keo-report-fail.json'));

      fireEvent.click(screen.getByRole('button', {name: 'Скачать'}));

      expect(created).toHaveLength(1);
      expect(created[0]).toContain('text/markdown');
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('omits the download button when downloadFileName is absent', () => {
    renderReport(readProps('keo-report-pass.json'));

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
  });
});
