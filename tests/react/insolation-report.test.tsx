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
        components: [{id: 'root', component: 'InsolationReport', ...props}],
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

describe('InsolationReport', () => {
  it('renders the verdict and the interrupted-insolation timeline in order', () => {
    const {container} = renderReport(readProps('insolation-report-pass.json'));

    expect(screen.getByText('Инсоляция — 2 ч 40 мин суммарно')).toBeTruthy();

    const segments = [...container.querySelectorAll<HTMLElement>('.a2ui-ir__segment')];
    expect(segments.map(segment => segment.dataset.kind)).toEqual(['sun', 'shadow', 'sun']);
    // Ось 8:00–16:00 = 480 мин; сегмент 9:20–10:40 — 80 мин от 80-й минуты оси.
    expect(segments[0]!.style.left).toBe('16.67%');
    expect(segments[0]!.style.width).toBe('16.66%');
    // Тень 10:40–12:00 идёт сразу за первым солнцем и той же длительности.
    expect(segments[1]!.style.left).toBe('33.33%');
    expect(segments[1]!.style.width).toBe('16.67%');
    // Подпись тени вынесена под ось: узкий сегмент текст не вмещает.
    expect(screen.getByText('тень · здание 1')).toBeTruthy();
    expect(screen.getByText('8:00')).toBeTruthy();
    expect(screen.getByText('16:00')).toBeTruthy();
  });

  it('renders checks with status dots and dispatches the project-level action', async () => {
    const {actions, container} = renderReport(readProps('insolation-report-pass.json'));

    expect(
      screen.getByText('суммарно 2 ч 40 мин ≥ 2 ч 30 мин — ветвь прерывистой инсоляции'),
    ).toBeTruthy();
    expect(container.querySelectorAll('.a2ui-ir__status--pass')).toHaveLength(2);
    expect(container.querySelectorAll('.a2ui-ir__status--info')).toHaveLength(1);

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Посчитать по проекту'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('insolation_project_calc');
    expect(actions[0]!.context).toMatchObject({pointId: 'p1'});
  });

  it('renders the fail filling: single sun segment and fail statuses', () => {
    const {container} = renderReport(readProps('insolation-report-fail.json'));

    expect(screen.getByText('Инсоляция — 1 ч 50 мин непрерывно')).toBeTruthy();
    expect(container.querySelectorAll('.a2ui-ir__segment--sun')).toHaveLength(1);
    expect(container.querySelectorAll('.a2ui-ir__status--fail')).toHaveLength(2);
  });

  it('marks system-assumed inputs and renders assumptions as warning plates', () => {
    const {container} = renderReport(readProps('insolation-report-pass.json'));

    const warningGroup = container.querySelector('.a2ui-ir__group--warning')!;
    expect(warningGroup.textContent).toContain('Модель застройки');
    expect(warningGroup.textContent).toContain('прямоугольные экраны');
    expect(warningGroup.textContent).toContain('+8,3 м');
    // Две плашки допущений плюс note группы исходных данных.
    expect(container.querySelectorAll('.a2ui-ir__note')).toHaveLength(3);
  });

  it('downloads the protocol as a client-side blob without revealing it', () => {
    const created: string[] = [];
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob: Blob) => {
      created.push(blob.type);
      return 'blob:demo';
    };
    URL.revokeObjectURL = () => {};

    try {
      const {container} = renderReport(readProps('insolation-report-pass.json'));

      expect(container.querySelector('details')).toBeNull();
      expect(container.querySelector('.a2ui-ir__protocol')!.textContent).not.toContain('Восход');

      fireEvent.click(screen.getByRole('button', {name: 'Скачать'}));

      expect(created).toHaveLength(1);
      expect(created[0]).toContain('text/markdown');
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('omits the download button when downloadFileName is absent', () => {
    renderReport(readProps('insolation-report-fail.json'));

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
  });
});
