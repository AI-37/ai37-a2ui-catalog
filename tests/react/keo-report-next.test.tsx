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

describe('KeoReportNext', () => {
  it('вердикт, «Что изменить», допущения и исходные данные', () => {
    const {container} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    const badge = container.querySelector('.a2ui-pill.a2ui-t--overline')!;
    expect(badge.textContent).toContain('Не соответствует СП 52.13330');
    expect(screen.getByText('КЕО — 0,42 % при норме 0,50 %')).toBeTruthy();

    expect(screen.getByText('Что изменить')).toBeTruthy();
    // Акцентная рамка — только у рекомендованного варианта (tone: 'success').
    const recommended = container.querySelectorAll('.a2ui-card--accent');
    expect(recommended).toHaveLength(1);
    expect(recommended[0]!.textContent).toContain('Окно 1,8 × 1,5 м');

    // Допущения — одной заметкой, исходные данные — карточкой.
    expect(container.textContent).toContain('C_N принят для северной');
    expect(screen.getByText('Исходные данные')).toBeTruthy();
  });

  it('слово состояния варианта зашито в рендерер, у neutral его нет', () => {
    const {container} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    // tone: 'fail' без действия — пилюля тем же словом, что у двух других отчётов.
    const failing = container.querySelector('.a2ui-pill.a2ui-t--strong.a2ui-t--danger')!;
    expect(failing.textContent).toBe('Не соответствует');

    // tone: 'neutral' с действием — только кнопка, статуса у него нет.
    expect(screen.getByRole('button', {name: 'Пересчитать с h_пд 0,6'})).toBeTruthy();
    expect(container.querySelectorAll('.a2ui-pill.a2ui-t--strong')).toHaveLength(1);
  });

  it('отправляет те же действия с тем же контекстом', async () => {
    const {actions} = renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Пересчитать с окном 1,8 × 1,5'}));
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(2);
    expect(actions[0]!.name).toBe('report_recalc');
    expect(actions[0]!.context).toMatchObject({roomId: 'r1', window: '1.8x1.5'});
    expect(actions[1]!.name).toBe('report_edit_inputs');
    expect(actions[1]!.context).toEqual({});
  });

  it('помещения: значение пилюлей, норма пояснением, действие — где задано', async () => {
    const {actions, container} = renderReport('KeoReportNext', readProps('keo-report-pass.json'));

    expect(screen.getByText('Помещения')).toBeTruthy();
    expect(screen.getAllByText('норма 0,50 %')).toHaveLength(2);
    expect(container.textContent).toContain('0,52 %');

    // Кнопка одна — у второго помещения; у первого агент действия не задал.
    const buttons = screen.getAllByRole('button', {name: 'Пересчитать'});
    expect(buttons).toHaveLength(1);

    await flush(() => {
      fireEvent.click(buttons[0]!);
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.context).toMatchObject({roomId: 'r2'});
  });

  it('протокол — строка без раскрытия и без текста вывода', () => {
    const props = readProps('keo-report-fail.json');
    const {container} = renderReport('KeoReportNext', props);

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(container.querySelector('details')).toBeNull();
    expect(container.querySelector('pre')).toBeNull();

    const content = (props.protocol as {content: string}).content;
    expect(container.textContent).not.toContain(content.slice(0, 40));
  });

  it('протокол текстом в props — один формат; без имени файла «Скачать» нет', async () => {
    renderReport('KeoReportNext', readProps('keo-report-fail.json'));

    const trigger = screen.getByRole('button', {name: /^Скачать/});
    await flush(() => {
      trigger.focus();
      fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    });

    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([
      'Markdown (.md)',
    ]);

    const {container} = renderReport('KeoReportNext', readProps('keo-report-pass.json'));
    expect(container.textContent).toContain('Протокол расчёта');
    expect(screen.queryAllByRole('button', {name: /^Скачать/})).toHaveLength(1);
  });
});
