import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {LOOKUP_DEBOUNCE_MS} from '@ai37/a2ui-catalog-schemas';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';

function readMessages(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'messages', fileName), 'utf8'),
  ) as A2uiMessage[];
}

function renderSurface(fileName: string) {
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(readMessages(fileName));
  const surface = processor.model.getSurface('demo-surface');
  const utils = render(<A2uiSurface surface={surface as any} />);
  return {surface: surface as any, ...utils};
}

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ok, json: async () => body});
}

// role=combobox есть и у <select>, поэтому lookup-инпут ищем по label поля.
function getLookupInput() {
  return screen.getByRole('combobox', {name: /Город строительства/});
}

async function typeAndFlush(input: HTMLElement, value: string) {
  fireEvent.change(input, {target: {value}});
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
  });
}

/** Опция материала прил. М со всеми тремя слотами оформления. */
const RICH_OPTION = {
  value: 'm-kirpich-glina',
  label:
    'Кирпичная кладка из сплошного кирпича — глиняного обыкновенного на цементно-песчаном растворе (ρ 1800)',
  group: 'Кирпичная кладка из сплошного кирпича',
  title: 'Глиняного обыкновенного на цементно-песчаном растворе',
  meta: 'ρ 1800 · λА 0,7 / λБ 0,81',
};

describe('lookup option rich render', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn(() => jsonResponse({options: []}));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('три слота → три строки в порядке group → title → meta', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: [RICH_OPTION]}));
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'кир');

    const option = screen.getByRole('option');
    const lines = Array.from(option.querySelectorAll('span'));
    expect(lines.map(line => line.textContent)).toEqual([
      RICH_OPTION.group,
      RICH_OPTION.title,
      RICH_OPTION.meta,
    ]);
  });

  it('без group — две строки, пустой строки над title нет', async () => {
    const {group, ...withoutGroup} = RICH_OPTION;
    fetchMock.mockImplementation(() => jsonResponse({options: [withoutGroup]}));
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'гли');

    const option = screen.getByRole('option');
    const lines = Array.from(option.querySelectorAll('span'));
    expect(lines.map(line => line.textContent)).toEqual([
      withoutGroup.title,
      withoutGroup.meta,
    ]);
  });

  it('без title — одна строка label, как до слотов', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [{value: 'msk', label: 'Москва'}]}),
    );
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'мос');

    const option = screen.getByRole('option', {name: 'Москва'});
    expect(option.querySelectorAll('span')).toHaveLength(0);
    expect(option).toHaveTextContent('Москва');
  });

  it('выбор многострочной опции кладёт в поле label, а не title', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: [RICH_OPTION]}));
    const {container} = renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    await typeAndFlush(input, 'кир');
    fireEvent.mouseDown(screen.getByRole('option'));

    expect((input as HTMLInputElement).value).toBe(RICH_OPTION.label);
    expect(container.querySelector('input[name="city"]')).toHaveValue(RICH_OPTION.value);
  });

  it('подсветка: «кир» выделяет жирным «Кир» в group с сохранением регистра', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: [RICH_OPTION]}));
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'кир');

    const option = screen.getByRole('option');
    const bold = Array.from(option.querySelectorAll('b'));
    expect(bold.map(part => part.textContent)).toContain('Кир');
    // Текст слота не искажён подсветкой.
    expect(option).toHaveTextContent(RICH_OPTION.group);
  });

  it('без совпадения — без подсветки, рендер не падает', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [{...RICH_OPTION, group: 'Ячеистые бетоны'}]}),
    );
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'ххх');

    const option = screen.getByRole('option');
    expect(option.querySelector('b')?.textContent ?? null).not.toBe('ххх');
  });

  it('спецсимволы во вводе не ломают рендер', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [{...RICH_OPTION, meta: '(ρ 1800) · λА 0,7'}]}),
    );
    renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    // Скобки — обычные символы подстроки, не синтаксис RegExp.
    await typeAndFlush(input, '(ρ 1800)');
    let option = screen.getByRole('option');
    expect(option.querySelector('b')?.textContent).toBe('(ρ 1800)');

    // Обратный слеш без совпадения — просто нет подсветки, без падения.
    await typeAndFlush(input, 'кир\\[');
    option = screen.getByRole('option');
    expect(option.querySelector('b')).toBeNull();
  });

  it('разметка в данных опции видна как текст, тег не применяется', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [{value: 'x', label: 'обычный', title: '<b>текст</b>'}]}),
    );
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'общ');

    const option = screen.getByRole('option');
    expect(option).toHaveTextContent('<b>текст</b>');
    expect(option.querySelector('b')).toBeNull();
  });

  it('индикатор виден в течение debounce; ответ вытесняет индикатор', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: [RICH_OPTION]}));
    const {container} = renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    // До истечения debounce запрос ещё не ушёл, но индикатор уже виден.
    fireEvent.change(input, {target: {value: 'кир'}});
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Ищем…');
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
    });

    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
    expect(screen.getByRole('option')).toBeInTheDocument();
  });

  it('пустой ответ даёт «Ничего не найдено», а не молчаливое закрытие', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: []}));
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'кир');

    expect(screen.getByRole('status')).toHaveTextContent('Ничего не найдено');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('ввод ниже порога закрывает попап без индикатора и сообщений', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: []}));
    renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    await typeAndFlush(input, 'кир');
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.change(input, {target: {value: 'к'}});

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('a11y: во время загрузки нет role="option", статус — role="status"', async () => {
    fetchMock.mockImplementation(() => jsonResponse({options: [RICH_OPTION]}));
    renderSurface('form-card-lookup-fetch-surface.json');

    fireEvent.change(getLookupInput(), {target: {value: 'кир'}});

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByRole('status')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
    });

    expect(screen.queryAllByRole('option')).toHaveLength(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('смешанная выдача рендерится одним списком', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [RICH_OPTION, {value: 'plain', label: 'Просто строка'}]}),
    );
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'кир');

    expect(screen.getAllByRole('listbox')).toHaveLength(1);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0].querySelectorAll('span').length).toBeGreaterThan(0);
    expect(options[1].querySelectorAll('span')).toHaveLength(0);
  });
});
