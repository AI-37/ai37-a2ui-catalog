import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {LOOKUP_DEBOUNCE_MS, LOOKUP_SUGGEST_ROUTE} from '@ai37/a2ui-catalog-schemas';
import {ai37Catalog, resolveLayerLambda} from '@ai37/a2ui-catalog-react';

function readMessages(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'messages', fileName), 'utf8'),
  ) as A2uiMessage[];
}

function renderSurface() {
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(readMessages('constructions-editor-surface.json'));
  const surface = processor.model.getSurface('demo-surface');
  const utils = render(<A2uiSurface surface={surface as any} />);
  return {surface: surface as any, ...utils};
}

function subscribeActions(surface: any) {
  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });
  return actions;
}

function getMaterialInputs() {
  return screen.getAllByPlaceholderText('Материал из справочника или свой');
}

function getThicknessInputs() {
  return screen.getAllByRole('spinbutton', {name: 'Толщина, мм'});
}

async function typeAndFlush(input: HTMLElement, value: string) {
  fireEvent.change(input, {target: {value}});
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
  });
}

describe('ConstructionsEditor', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})}));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('рендерит карточки из фикстуры: слои, live-чипы, паспортное Rпр, сводка', () => {
    renderSurface();

    // Три карточки с чипами: стена проходит, пол по грунту (без 1/αн) — нет,
    // окно по паспортному Rпр — проходит.
    expect(screen.getByText('Наружная стена (кирпич + минвата)')).toBeInTheDocument();
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.21 < 4.20')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.56 ≥ 0.54')).toBeInTheDocument();
    expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();

    // Тип без слоёв — поле паспортного Rпр вместо таблицы.
    expect(screen.getByRole('spinbutton', {name: /Rпр по паспорту/})).toHaveValue(0.56);

    // Зазор — без ввода λ, подсказка про серверный Rs.
    expect(screen.getByText('Rs — в итоговом расчёте')).toBeInTheDocument();
  });

  it('пол по грунту: live-Rпр без члена 1/αн (alphaN-record без записи)', () => {
    renderSurface();

    // 1/8.7 + 0.2/2.04 = 0.21 — если бы 1/αн трактовался как деление на
    // отсутствующее значение, чип был бы NaN/Infinity.
    expect(screen.getByText('Rпр 0.21 < 4.20')).toBeInTheDocument();
  });

  it('λ-дефолт: без condition — λБ, синхронно с teplo-calc (фикстура минваты)', () => {
    // Значения строки минваты из fixtures/valid/constructions-editor.json —
    // общая точка синхронизации с серверным resolve-layer-lambda teplo-calc.
    const layer = {material: 'Плиты минераловатные', thicknessMm: 150, lambdaA: 0.045, lambdaB: 0.048};

    expect(resolveLayerLambda(layer, undefined)).toBe(0.048);
    expect(resolveLayerLambda(layer, 'Б')).toBe(0.048);
    expect(resolveLayerLambda(layer, 'А')).toBe(0.045);
    expect(resolveLayerLambda({...layer, lambdaManual: 0.05}, 'А')).toBe(0.05);
  });

  it('изменение толщины пересчитывает чип и сводку без action\'ов', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);

    // Толщина минваты (2-я строка стены): 150 → 10 — Rпр падает ниже Rнорм.
    fireEvent.change(getThicknessInputs()[1]!, {target: {value: '10'}});

    expect(screen.getByText('Rпр 1.17 < 3.19')).toBeInTheDocument();
    expect(screen.getByText('проходит 1 из 3')).toBeInTheDocument();
    expect(actions).toHaveLength(0);
  });

  it('add/remove слоя — мгновенно, без action\'ов и сети', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);
    const initialRows = getMaterialInputs().length;

    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    expect(getMaterialInputs()).toHaveLength(initialRows + 1);

    fireEvent.click(screen.getAllByRole('button', {name: 'Удалить слой'})[0]!);
    expect(getMaterialInputs()).toHaveLength(initialRows);

    expect(actions).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('add/remove конструкции; смена типа на «без слоёв» показывает паспортное Rпр', () => {
    renderSurface();

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
    // Новая карточка первого типа из typeConfigs ("Наружные стены").
    expect(screen.getAllByRole('button', {name: 'Удалить конструкцию'})).toHaveLength(4);

    // Смена типа новой карточки на окна (hasLayers: false) → поле паспорта.
    const typeSelects = screen.getAllByRole('combobox', {name: 'Тип конструкции'});
    fireEvent.change(typeSelects[typeSelects.length - 1]!, {target: {value: 'okna'}});
    expect(screen.getAllByRole('spinbutton', {name: /Rпр по паспорту/})).toHaveLength(2);

    const removeButtons = screen.getAllByRole('button', {name: 'Удалить конструкцию'});
    fireEvent.click(removeButtons[removeButtons.length - 1]!);
    expect(screen.getAllByRole('button', {name: 'Удалить конструкцию'})).toHaveLength(3);
  });

  it('lookup строки: выбор опции с λ заполняет materialKey и λ («авто»)', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          options: [{value: 'm-beton-b25', label: 'Бетон B25', lambdaA: 1.7, lambdaB: 1.86}],
        }),
      }),
    );
    renderSurface();

    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    const materialInput = getMaterialInputs()[4]!; // новая 5-я строка стены

    await typeAndFlush(materialInput, 'бет');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      `${LOOKUP_SUGGEST_ROUTE}?${new URLSearchParams({referenceId: 'sp50-materials', query: 'бет'})}`,
    );

    fireEvent.mouseDown(screen.getByRole('option', {name: 'Бетон B25'}));

    expect((materialInput as HTMLInputElement).value).toBe('Бетон B25');
    // condition Б → λБ из опции, ручного ввода λ в строке нет.
    expect(screen.getByText('1.86')).toBeInTheDocument();
    expect(screen.queryAllByRole('spinbutton', {name: /λ.*вручную/})).toHaveLength(1); // только фибролит
  });

  it('свободный текст без выбора опции — обязательная ручная λ', async () => {
    renderSurface();

    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    const materialInput = getMaterialInputs()[4]!;

    await typeAndFlush(materialInput, 'самодельный утеплитель');

    // Строка без λ из справочника → ручной ввод (плюс существующий фибролит).
    expect(screen.getAllByRole('spinbutton', {name: /λ.*вручную/})).toHaveLength(2);
  });

  it('невалидный submit блокируется с подсветкой, action не уходит', async () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);

    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(0);
    expect(screen.getByText('Заполните подсвеченные поля')).toBeInTheDocument();
    expect(screen.getByText('Укажите материал')).toBeInTheDocument();
  });

  it('валидный submit — ровно один action с полным массивом конструкций', async () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('constructions:apply');

    const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
    expect(constructions).toHaveLength(3);
    expect(constructions[0]).toMatchObject({id: 'c-wall-1', type: 'steny'});
    expect((constructions[0]!.layers as unknown[])).toHaveLength(4);
    expect(constructions[1]).toMatchObject({subtype: 'pol_po_gruntu'});
    expect(constructions[2]).toMatchObject({rprPassport: 0.56});
  });

  it('back уходит без валидации с backActionContext', async () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);

    // Незаполненная строка не мешает back.
    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Назад'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('navigate');
    expect(actions[0]!.context).toMatchObject({target: 'climate'});
  });

  it('аккордеон: сворачивание карточки прячет таблицу, чип остаётся', () => {
    renderSurface();
    const initialRows = getMaterialInputs().length;

    fireEvent.click(screen.getByRole('button', {name: /Наружная стена/}));

    expect(getMaterialInputs().length).toBeLessThan(initialRows);
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
  });
});
