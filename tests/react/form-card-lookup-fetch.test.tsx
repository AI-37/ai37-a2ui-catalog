import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {
  LOOKUP_DEBOUNCE_MS,
  LOOKUP_SUGGEST_ACTION,
  LOOKUP_SUGGEST_ROUTE,
} from '@ai37/a2ui-catalog-schemas';
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

/** Никогда не резолвится сам; реджектится AbortError'ом по сигналу — как настоящий fetch. */
function pendingUntilAbort(init?: RequestInit) {
  return new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    );
  });
}

function suggestUrl(referenceId: string, query: string) {
  return `${LOOKUP_SUGGEST_ROUTE}?${new URLSearchParams({referenceId, query})}`;
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

describe('FormCard lookup fetch mode', () => {
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

  it('не ходит в сеть ниже порога minChars', async () => {
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'мо');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('после debounce шлёт один GET с referenceId, query и signal', async () => {
    renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'мос');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(suggestUrl('cities', 'мос'));
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('несколько keystroke в окне debounce схлопываются в один запрос', async () => {
    renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    fireEvent.change(input, {target: {value: 'мос'}});
    fireEvent.change(input, {target: {value: 'моск'}});
    fireEvent.change(input, {target: {value: 'москв'}});
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(suggestUrl('cities', 'москв'));
  });

  it('новый запрос отменяет предыдущий in-flight; виден ответ последнего', async () => {
    fetchMock
      .mockImplementationOnce((_url: string, init: RequestInit) => pendingUntilAbort(init))
      .mockImplementationOnce(() =>
        jsonResponse({options: [{value: 'msk', label: 'Москва'}]}),
      );
    renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    await typeAndFlush(input, 'мос');
    await typeAndFlush(input, 'москв');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(firstInit.signal?.aborted).toBe(true);
    expect(screen.getByRole('option', {name: 'Москва'})).toBeInTheDocument();
  });

  it('рендерит опции; выбор кладёт value в скрытый input и закрывает дропдаун', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({
        options: [
          {value: 'msk', label: 'Москва', region: 'Московская область'},
          {value: 'spb', label: 'Санкт-Петербург'},
        ],
      }),
    );
    const {container} = renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    await typeAndFlush(input, 'мос');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('option', {name: 'Москва'}));

    expect((input as HTMLInputElement).value).toBe('Москва');
    expect(container.querySelector('input[name="city"]')).toHaveValue('msk');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it.each([
    ['не-2xx ответ', () => jsonResponse({error: 'unknown_reference'}, false)],
    ['сетевая ошибка', () => Promise.reject(new TypeError('fetch failed'))],
    ['malformed-тело', () => jsonResponse({unexpected: true})],
  ])('тихий fallback: %s — дропдаун пуст, поле редактируемо', async (_name, impl) => {
    fetchMock.mockImplementation(impl);
    renderSurface('form-card-lookup-fetch-surface.json');
    const input = getLookupInput();

    await typeAndFlush(input, 'мос');

    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.change(input, {target: {value: 'москва вручную'}});
    expect((input as HTMLInputElement).value).toBe('москва вручную');
  });

  it('выбранное значение уходит в submit-action; без выбора — пустая строка', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({options: [{value: 'msk', label: 'Москва'}]}),
    );
    const {surface, container} = renderSurface('form-card-lookup-fetch-surface.json');
    const actions: Array<{name: string; context: Record<string, unknown>}> = [];
    surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
      actions.push(action);
    });
    const form = container.querySelector('form') as HTMLFormElement;

    // onAction.emit — асинхронный: submit оборачиваем в act, чтобы дождаться эмита.
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(actions[0]?.name).toBe('submit_building_params');
    expect(actions[0]?.context.city).toBe('');

    await typeAndFlush(getLookupInput(), 'мос');
    fireEvent.mouseDown(screen.getByRole('option', {name: 'Москва'}));
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(actions[1]?.context.city).toBe('msk');
  });

  it('unmount при in-flight запросе отменяет его', async () => {
    fetchMock.mockImplementationOnce((_url: string, init: RequestInit) =>
      pendingUntilAbort(init),
    );
    const {unmount} = renderSurface('form-card-lookup-fetch-surface.json');

    await typeAndFlush(getLookupInput(), 'мос');
    unmount();

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.signal?.aborted).toBe(true);
  });

  it('регресс: без suggestMode работает action-режим, fetch не вызывается', async () => {
    const {surface} = renderSurface('form-card-surface.json');
    const actions: Array<{name: string; context: Record<string, unknown>}> = [];
    surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
      actions.push(action);
    });

    await typeAndFlush(getLookupInput(), 'мос');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(actions).toHaveLength(1);
    expect(actions[0].name).toBe(LOOKUP_SUGGEST_ACTION);
    expect(actions[0].context).toMatchObject({
      fieldName: 'city',
      referenceId: 'cities',
      query: 'мос',
    });
  });
});
