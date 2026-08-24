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

/**
 * Наполнение общее с нынешним `ThermalReport` — те же фикстуры, только
 * адресованные новому рендереру: сравнивать «было / стало» на разных данных
 * бессмысленно (change reports-next). Поэтому здесь проверяется не разметка,
 * а состав экрана, контракт действий и применённый канон отчётов.
 */
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
        components: [{id: 'root', component: 'ThermalReportNext', ...props}],
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

/** Меню Base UI раскрывается с клавиатуры: в jsdom попапу нечего измерять. */
async function openMenu(name: string) {
  const trigger = screen.getByRole('button', {name: new RegExp(`^${name}`)});
  await flush(() => {
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
  return trigger;
}

describe('ThermalReportNext: одна конструкция', () => {
  it('вердикт, проверки и таблица слоёв', () => {
    const {container} = renderReport(readProps('thermal-report-single.json'));

    // Вердикт: статусная пилюля ступени badge и serif-заголовок.
    const badge = container.querySelector('.a2ui-pill.a2ui-t--overline')!;
    expect(badge.textContent).toContain('Соответствует СП 50.13330');
    expect(container.querySelector('.a2ui-t--display.a2ui-t--serif')!.textContent).toContain(
      'R₀ приведённое',
    );

    expect(screen.getByText('Проверки')).toBeTruthy();
    // `info` — справочная строка: статуса у неё нет, кнопки тоже.
    expect(screen.getAllByText('Соответствует')).toHaveLength(2);

    // Таблица слоёв со своим скроллом и итоговой строкой.
    expect(container.querySelector('.a2ui-table-scroll')).toBeTruthy();
    expect(container.querySelector('.a2ui-table__footer')!.textContent).toContain('R₀ приведённое');

    expect(screen.getByText('Исходные данные')).toBeTruthy();
  });

  it('кнопка роли отправляет то же действие, что и старый рендерер', async () => {
    const {actions} = renderReport(readProps('thermal-report-single.json'));

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('report_edit_inputs');
    expect(actions[0]!.context).toEqual({});
  });

  it('протокол — строка без раскрытия, содержимое на экране не выводится', () => {
    const props = readProps('thermal-report-single.json');
    const {container} = renderReport(props);

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(container.querySelector('details')).toBeNull();
    expect(container.querySelector('pre')).toBeNull();

    const content = (props.protocol as {content: string}).content;
    expect(container.textContent).not.toContain(content.slice(0, 40));
  });
});

describe('ThermalReportNext: список конструкций', () => {
  it('отклонения, «Подобрать» у непроходящих и строка исключённых', () => {
    const {container} = renderReport(readProps('thermal-report-multi.json'));

    expect(screen.getByText('Конструкции')).toBeTruthy();
    expect(screen.getByText('Наружные стены выше 0,000')).toBeTruthy();
    // Знак, запятая и тон посчитаны из числа, а не пришли строкой.
    // Ступень `row`, а не `badge`: тон вердикта в шапке тот же.
    const failing = container.querySelector('.a2ui-pill.a2ui-t--strong.a2ui-t--danger')!;
    expect(failing.textContent).toContain('%');

    // Тон рамки строки списка не несёт: акцент оставлен рекомендованному варианту.
    expect(container.querySelector('.a2ui-card--accent')).toBeNull();

    expect(screen.getByRole('button', {name: 'Вернуть в расчёт'})).toBeTruthy();
    expect(screen.getAllByRole('button', {name: 'Подобрать'}).length).toBeGreaterThan(0);
  });

  it('«Подобрать» отправляет действие с constructionId', async () => {
    const {actions} = renderReport(readProps('thermal-report-multi.json'));

    await flush(() => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Подобрать'})[0]!);
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('report_fix_construction');
    expect(actions[0]!.context.constructionId).toBeTruthy();
  });
});

describe('ThermalReportNext: «Скачать»', () => {
  it('протокол Blob’ом — один формат', async () => {
    renderReport(readProps('thermal-report-single.json'));

    await openMenu('Скачать');

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(1);
    expect(items[0]!.textContent).toBe('Markdown (.md)');
  });

  it('скачивать нечего — триггера нет', () => {
    const props = readProps('thermal-report-single.json');
    const protocol = props.protocol as Record<string, unknown>;
    renderReport({
      ...props,
      protocol: {meta: protocol.meta, content: protocol.content},
    });

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Скачать/})).toBeNull();
  });
});
