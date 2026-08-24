import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {AGENT_RESOURCE_ROUTE, RECOMMEND_DEBOUNCE_MS} from '@ai37/a2ui-catalog-schemas';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

const DRAFT_ACTION = 'lift:draft';

/**
 * Блок подбора: побочный канал, актуальность списка, применение варианта и
 * тихая деградация. Наполнение — фикстура каталога с пропом `recommend`;
 * сеть замокана целиком, потому что проверяется контракт канала, а не ручка.
 */
function readProps(fileName: string): Record<string, any> {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, any>;
}

function recommendProps() {
  return {...readProps('lift-editor-recommend.json'), draftAction: DRAFT_ACTION};
}

/** Те же props без пропа `recommend` — путь отката. */
function plainProps() {
  const props = recommendProps();
  delete props['recommend'];
  return props;
}

function renderEditor(props: Record<string, unknown>) {
  const messages: A2uiMessage[] = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'LiftEditorNext', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as any;

  const actions: Array<{name: string; context: Record<string, any>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, any>}) => {
    actions.push(action);
  });

  return {actions, ...render(<A2uiSurface surface={surface} />)};
}

function variant(id: string, count: number, values: Record<string, string | number>, extra = {}) {
  return {id, title: `Вариант ${id}`, subtitle: `${count} лифта`, apply: {count, values}, ...extra};
}

const FIVE = [
  variant('v1', 3, {Q: 1000, Vn: '1.6'}, {notes: ['tи 62 с'], tone: 'ok'}),
  variant('v2', 3, {Q: 630, Vn: '1.6'}),
  variant('v3', 4, {Q: 630, Vn: '1'}),
  variant('v4', 3, {Q: 1000, Vn: '1'}),
  variant('v5', 2, {Q: 1000, Vn: '1.6'}, {tone: 'near'}),
];

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({ok, json: async () => body});
}

/** Не резолвится сам; реджектится AbortError'ом по сигналу — как настоящий fetch. */
function pendingUntilAbort(init?: RequestInit) {
  return new Promise((_unused, reject) => {
    init?.signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    );
  });
}

async function settle() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(RECOMMEND_DEBOUNCE_MS);
  });
}

function section(title: string) {
  return screen.getByRole('button', {name: new RegExp(`^${title}(?!\\d)`)});
}

function sectionPanel(title: string) {
  return section(title).closest('.a2ui-card') as HTMLElement;
}

function fieldIn(title: string, name: string) {
  return sectionPanel(title).querySelector<HTMLInputElement>(`[name="${name}"]`)!;
}

function lastQuery(fetchMock: ReturnType<typeof vi.fn>) {
  const url = String(fetchMock.mock.calls.at(-1)?.[0] ?? '');
  return new URLSearchParams(url.slice(url.indexOf('?') + 1));
}

describe('LiftEditorNext: блок подбора', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('без пропа recommend блока нет и сеть не трогается', async () => {
    renderEditor(plainProps());
    await settle();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Подходящие конфигурации')).toBeNull();
  });

  it('заполненные обязательные поля дают один GET с ожидаемым query', async () => {
    fetchMock.mockImplementation(() => jsonResponse({variants: FIVE}));
    renderEditor(recommendProps());
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url.startsWith(`${AGENT_RESOURCE_ROUTE}?`)).toBe(true);

    const query = lastQuery(fetchMock);
    expect(query.get('resource')).toBe('lift-recommend');
    expect(query.get('taskId')).toBe('calc-52941-demo');
    expect(query.get('N')).toBe('17');
    expect(query.get('A')).toBe('340');
    // scope: 'lift' — из первой лифтовой секции; ноль не пустота.
    expect(query.get('H0')).toBe('0');
    expect(query.get('Nn')).toBe('1');
  });

  it('пока обязательное поле пусто, блока нет', async () => {
    const props = recommendProps();
    props['building'] = {...props['building'], A: ''};
    renderEditor(props);
    await settle();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Подходящие конфигурации')).toBeNull();
  });

  it('быстрая правка: запрос по последнему значению, предыдущий отменён', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => pendingUntilAbort(init));
    renderEditor(recommendProps());
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const field = fieldIn('Здание', 'N');
    await act(async () => {
      fireEvent.change(field, {target: {value: '18'}});
      await vi.advanceTimersByTimeAsync(RECOMMEND_DEBOUNCE_MS / 3);
      fireEvent.change(field, {target: {value: '19'}});
    });
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastQuery(fetchMock).get('N')).toBe('19');
    const firstSignal = (fetchMock.mock.calls[0]![1] as RequestInit).signal!;
    expect(firstSignal.aborted).toBe(true);
  });

  it('ответ на устаревший ввод не отрисовывается, а нормализованное эхо — не протухшее', async () => {
    fetchMock.mockImplementation((url: string) => {
      const sent = new URLSearchParams(String(url).slice(String(url).indexOf('?') + 1));
      // Ручка нормализует «17» → 17: числовое сравнение обязано это пережить.
      return jsonResponse({echo: {N: Number(sent.get('N')), A: Number(sent.get('A'))}, variants: FIVE});
    });
    renderEditor(recommendProps());
    await settle();
    expect(screen.getByText('Вариант v1')).toBeTruthy();

    // Эхо про другой ввод — тихий выброс: список снят, ошибок на экране нет.
    fetchMock.mockImplementation(() => jsonResponse({echo: {N: 99}, variants: FIVE}));
    await act(async () => {
      fireEvent.change(fieldIn('Здание', 'N'), {target: {value: '18'}});
    });
    await settle();

    expect(screen.queryByText('Вариант v1')).toBeNull();
    expect(screen.queryByText('Подходящие конфигурации')).toBeNull();
  });

  it('404, сетевая ошибка и мусорное тело прячут блок, форма работает', async () => {
    for (const failure of [
      () => jsonResponse({error: 'unknown_resource'}, false),
      () => Promise.reject(new Error('network')),
      () => jsonResponse({unexpected: true}),
    ]) {
      fetchMock.mockImplementation(failure);
      const {unmount} = renderEditor(recommendProps());
      await settle();

      expect(screen.queryByText('Подходящие конфигурации')).toBeNull();
      expect(section('Здание')).toBeTruthy();
      unmount();
    }
  });

  it('показаны только topCount карточек, списка выбора нет', async () => {
    fetchMock.mockImplementation(() => jsonResponse({variants: FIVE}));
    const {unmount} = renderEditor(recommendProps());
    await settle();

    // topCount 2: две карточки, остальные три не показываются вовсе —
    // списка выбора у блока нет (design.md, Решение 11).
    expect(screen.getAllByRole('button', {name: 'Применить'})).toHaveLength(2);
    expect(screen.getByText('Вариант v1')).toBeTruthy();
    expect(screen.getByText('Вариант v2')).toBeTruthy();
    expect(screen.queryByText('Вариант v3')).toBeNull();
    expect(screen.queryByRole('combobox', {name: 'Ещё варианты'})).toBeNull();
    unmount();

    fetchMock.mockImplementation(() => jsonResponse({variants: []}));
    renderEditor(recommendProps());
    await settle();

    expect(
      screen.getByText('Под это здание ничего не подошло — проверьте число этажей и жильцов'),
    ).toBeTruthy();
  });

  it('применение варианта на три лифта: три секции и один немедленный черновик', async () => {
    fetchMock.mockImplementation(() => jsonResponse({variants: FIVE}));
    const {actions} = renderEditor(recommendProps());
    await settle();

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Применить'})[0]!);
    });

    expect(section('Лифт 3')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Лифт 4/})).toBeNull();

    const drafts = actions.filter(action => action.name === DRAFT_ACTION);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]!.context['lifts']).toHaveLength(3);
    for (const lift of drafts[0]!.context['lifts'] as Array<Record<string, unknown>>) {
      expect(lift['Q']).toBe(1000);
      expect(lift['Vn']).toBe('1.6');
    }
  });

  it('зависимые правила не перетирают подставленное, подпись источника снята', async () => {
    // Правило по Vn '1' ставит h 1.5 / t123 13.5 — вариант несёт своё.
    fetchMock.mockImplementation(() =>
      jsonResponse({variants: [variant('v1', 1, {Q: 1000, Vn: '1', h: 2.2, t123: 20})]}),
    );
    const {actions} = renderEditor(recommendProps());
    await settle();
    // Подпись источника поля Q до применения на месте.
    expect(screen.getAllByText('предложено по классу здания').length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });

    const draft = actions.filter(action => action.name === DRAFT_ACTION).at(-1)!;
    const lift = (draft.context['lifts'] as Array<Record<string, unknown>>)[0]!;
    expect(lift['h']).toBe(2.2);
    expect(lift['t123']).toBe(20);
    expect(screen.queryByText('предложено по классу здания')).toBeNull();
  });

  it('число секций клампится по maxLifts', async () => {
    fetchMock.mockImplementation(() => jsonResponse({variants: [variant('v1', 6, {Q: 1000})]}));
    const props = recommendProps();
    props['methodConfigs'] = props['methodConfigs'].map((config: any) =>
      config.method === '52941' ? {...config, maxLifts: 2} : config,
    );
    renderEditor(props);
    await settle();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });

    expect(section('Лифт 2')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Лифт 3/})).toBeNull();
  });

  it('в режиме группы секция одна, число лифтов приезжает полем здания', async () => {
    fetchMock.mockImplementation(() =>
      jsonResponse({
        variants: [
          variant('g1', 4, {Q: 1000, Vn: '1.6'}, {apply: {count: 4, values: {Q: 1000}, buildingValues: {Nl: 3}}}),
        ],
      }),
    );
    const group = readProps('lift-editor-group.json');
    const props = {
      ...group,
      draftAction: DRAFT_ACTION,
      recommend: {
        ...recommendProps()['recommend'],
        params: [
          {name: 'A', required: true},
          {name: 'N1', required: true},
        ],
      },
    };
    const {actions} = renderEditor(props);
    await settle();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });

    const draft = actions.filter(action => action.name === DRAFT_ACTION).at(-1)!;
    expect(draft.context['lifts']).toHaveLength(1);
    expect((draft.context['building'] as Record<string, unknown>)['Nl']).toBe(3);
  });

  it('«Далее» ходит по секциям так же, как без блока', async () => {
    fetchMock.mockImplementation(() => jsonResponse({variants: FIVE}));
    const props = recommendProps();
    // Пустое обязательное поле лифта — цель навигации «Далее».
    props['lifts'] = [{...props['lifts'][0], Q: ''}, props['lifts'][1]];
    renderEditor(props);
    await settle();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));
    });

    // Блок в очередь секций не встал: раскрылась незаполненная лифтовая.
    expect(section('Лифт 1').getAttribute('aria-expanded')).toBe('true');
    expect(section('Здание').getAttribute('aria-expanded')).toBe('false');
  });
});
