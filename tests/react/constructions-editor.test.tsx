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

function patchedMessages(propOverrides?: Record<string, unknown>) {
  const messages = readMessages('constructions-editor-surface.json');
  if (propOverrides) {
    const update = messages.find(message => 'updateComponents' in message) as any;
    Object.assign(update.updateComponents.components[0], propOverrides);
  }
  return messages;
}

function renderSurface(propOverrides?: Record<string, unknown>) {
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(patchedMessages(propOverrides));
  const surface = processor.model.getSurface('demo-surface');
  const utils = render(<A2uiSurface surface={surface as any} />);
  return {processor, surface: surface as any, ...utils};
}

/** Новые props от агента: тот же surface, обновлённый компонент. */
async function updateProps(
  processor: MessageProcessor<any>,
  propOverrides: Record<string, unknown>,
) {
  const update = patchedMessages(propOverrides).find(
    message => 'updateComponents' in message,
  ) as A2uiMessage;
  await act(async () => {
    processor.processMessages([update]);
  });
}

function subscribeActions(surface: any) {
  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });
  return actions;
}

function openTab(name: 'Общие данные' | 'Конструкции') {
  fireEvent.click(screen.getByRole('tab', {name}));
}

function getMaterialInputs() {
  return screen.getAllByPlaceholderText('Материал из справочника или свой');
}

function getThicknessInputs() {
  return screen.getAllByRole('spinbutton', {name: 'Толщина, мм'});
}

function getCityInput() {
  return screen.getByPlaceholderText('Город из справочника');
}

/** Поля климата ищем по расшифровке в подписи (обозначение идёт с <sub>). */
const CLIMATE_LABELS = {
  tot: /средняя темп\. отопительного периода/,
  zot: /продолжительность отопит\. периода/,
  tn: /холодной пятидневки/,
  tv: /расчётная внутренняя температура/,
} as const;

function climateInput(key: keyof typeof CLIMATE_LABELS) {
  return screen.getByLabelText(CLIMATE_LABELS[key]);
}

async function typeAndFlush(input: HTMLElement, value: string) {
  fireEvent.change(input, {target: {value}});
  await act(async () => {
    await vi.advanceTimersByTimeAsync(LOOKUP_DEBOUNCE_MS);
  });
}

const EMPTY_GENERAL = {
  buildingType: null,
  city: null,
  tot: null,
  zot: null,
  tn: null,
  tv: null,
  condition: null,
};

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
    openTab('Конструкции');

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
    openTab('Конструкции');

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
    openTab('Конструкции');

    // Толщина минваты (2-я строка стены): 150 → 10 — Rпр падает ниже Rнорм.
    fireEvent.change(getThicknessInputs()[1]!, {target: {value: '10'}});

    expect(screen.getByText('Rпр 1.17 < 3.19')).toBeInTheDocument();
    expect(screen.getByText('проходит 1 из 3')).toBeInTheDocument();
    expect(actions).toHaveLength(0);
  });

  it('add/remove слоя — мгновенно, без action\'ов и сети', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);
    openTab('Конструкции');
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
    openTab('Конструкции');

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
    openTab('Конструкции');

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

  it('свободный текст без выбора опции — ручная λ', async () => {
    renderSurface();
    openTab('Конструкции');

    fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
    const materialInput = getMaterialInputs()[4]!;

    await typeAndFlush(materialInput, 'самодельный утеплитель');

    // Строка без λ из справочника → ручной ввод (плюс существующий фибролит).
    expect(screen.getAllByRole('spinbutton', {name: /λ.*вручную/})).toHaveLength(2);
  });

  it('аккордеон: сворачивание карточки прячет таблицу, чип остаётся', () => {
    renderSurface();
    openTab('Конструкции');
    const initialRows = getMaterialInputs().length;

    fireEvent.click(screen.getByRole('button', {name: /Наружная стена/}));

    expect(getMaterialInputs().length).toBeLessThan(initialRows);
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
  });

  describe('вкладки', () => {
    it('переключение локально: action\'ов нет, ввод обеих вкладок жив', () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

      // Стартовая вкладка — общие данные.
      expect(getCityInput()).toHaveValue('Москва');

      openTab('Конструкции');
      fireEvent.change(screen.getAllByLabelText('Название')[0]!, {target: {value: 'Стена А'}});

      openTab('Общие данные');
      fireEvent.change(climateInput('tv'), {target: {value: '22'}});

      openTab('Конструкции');
      expect(screen.getAllByLabelText('Название')[0]).toHaveValue('Стена А');

      openTab('Общие данные');
      expect(climateInput('tv')).toHaveValue(22);

      expect(actions).toHaveLength(0);
    });

    it('«Далее» ведёт на конструкции, ввод общих данных не теряется', () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));

      // Вкладка конструкций открыта, submit — здесь.
      expect(screen.getByRole('tab', {name: 'Конструкции'})).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('button', {name: 'Рассчитать'})).toBeInTheDocument();
      expect(actions).toHaveLength(0);

      openTab('Общие данные');
      expect(climateInput('tv')).toHaveValue(22);
    });

    it('на общих данных нет submit\'а и сводки по конструкциям', () => {
      renderSurface();

      expect(screen.getByRole('button', {name: 'Далее'})).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Рассчитать'})).not.toBeInTheDocument();
      expect(screen.queryByText(/проходит/)).not.toBeInTheDocument();
    });

    it('подпись кнопки перехода берётся из nextLabel', () => {
      renderSurface({nextLabel: 'К конструкциям'});

      expect(screen.getByRole('button', {name: 'К конструкциям'})).toBeInTheDocument();
    });

    it('без пропа general вкладок нет — прежний экран конструкций', () => {
      renderSurface({general: undefined});

      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(screen.getByText('Наружная стена (кирпич + минвата)')).toBeInTheDocument();
    });

    it('без backLabel/backAction кнопки возврата нет', () => {
      renderSurface();

      expect(screen.queryByRole('button', {name: 'Назад'})).not.toBeInTheDocument();
    });

    it('заданная кнопка возврата шлёт backAction без валидации', async () => {
      const {surface} = renderSurface({
        backLabel: 'Назад',
        backAction: 'navigate',
        backActionContext: {target: 'climate'},
      });
      const actions = subscribeActions(surface);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Назад'}));
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('navigate');
      expect(actions[0]!.context).toMatchObject({target: 'climate'});
    });
  });

  describe('вкладка общих данных', () => {
    const cityOption = {value: 'novosibirsk', label: 'Новосибирск', tot: -6.4, zot: 218, tn: -33};

    function mockCities(options: unknown[]) {
      fetchMock.mockImplementation(() =>
        Promise.resolve({ok: true, json: async () => ({options})}),
      );
    }

    it('выбор города заполняет tот/zот/tн, значения остаются редактируемыми', async () => {
      mockCities([cityOption]);
      renderSurface();

      await typeAndFlush(getCityInput(), 'ново');

      expect(String(fetchMock.mock.calls[0]![0])).toBe(
        `${LOOKUP_SUGGEST_ROUTE}?${new URLSearchParams({referenceId: 'cities', query: 'ново'})}`,
      );

      fireEvent.mouseDown(screen.getByRole('option', {name: 'Новосибирск'}));

      expect(getCityInput()).toHaveValue('Новосибирск');
      expect(climateInput('tot')).toHaveValue(-6.4);
      expect(climateInput('zot')).toHaveValue(218);
      expect(climateInput('tn')).toHaveValue(-33);

      // Подставленное правится руками.
      fireEvent.change(climateInput('zot'), {target: {value: '250'}});
      expect(climateInput('zot')).toHaveValue(250);
    });

    it('тип здания по умолчанию — первый вариант списка', () => {
      renderSurface({general: EMPTY_GENERAL});

      // Агент прислал пустой buildingType → выбран первый из buildingTypeOptions.
      expect(screen.getByLabelText('Тип здания')).toHaveValue('Жилое многоквартирное');

      // Пустой выбор остаётся доступным.
      fireEvent.change(screen.getByLabelText('Тип здания'), {target: {value: ''}});
      expect(screen.getByLabelText('Тип здания')).toHaveValue('');
    });

    it('опция без климата: заполняется только город', async () => {
      mockCities([{value: 'unknown-city', label: 'Городок'}]);
      renderSurface();

      await typeAndFlush(getCityInput(), 'горо');
      fireEvent.mouseDown(screen.getByRole('option', {name: 'Городок'}));

      expect(getCityInput()).toHaveValue('Городок');
      expect(climateInput('tot')).toHaveValue(-2.2);
      expect(climateInput('zot')).toHaveValue(205);
      expect(climateInput('tn')).toHaveValue(-25);
    });

    it('смена города перезаписывает климат новой опцией', async () => {
      mockCities([cityOption, {value: 'sochi', label: 'Сочи', tot: 8.5, zot: 92, tn: -2}]);
      renderSurface();

      await typeAndFlush(getCityInput(), 'нов');
      fireEvent.mouseDown(screen.getByRole('option', {name: 'Новосибирск'}));
      expect(climateInput('tot')).toHaveValue(-6.4);

      await typeAndFlush(getCityInput(), 'соч');
      fireEvent.mouseDown(screen.getByRole('option', {name: 'Сочи'}));

      expect(getCityInput()).toHaveValue('Сочи');
      expect(climateInput('tot')).toHaveValue(8.5);
      expect(climateInput('zot')).toHaveValue(92);
      expect(climateInput('tn')).toHaveValue(-2);
    });

    it('смена условия эксплуатации пересчитывает live-Rпр по λА', () => {
      renderSurface();

      fireEvent.change(screen.getByLabelText('Условие эксплуатации'), {target: {value: 'А'}});
      openTab('Конструкции');

      // λА вместо λБ: 1/8.7 + 1/23 + 0.38/0.7 + 0.15/0.045 + 0.03/0.09 = 4.37.
      expect(screen.getByText('Rпр 4.37 ≥ 3.19')).toBeInTheDocument();
    });
  });

  describe('чипы Rнорм и правки климата', () => {
    it('климат не тронут — сравнение и сводка на месте', () => {
      renderSurface();
      openTab('Конструкции');

      fireEvent.change(getThicknessInputs()[1]!, {target: {value: '160'}});

      expect(screen.getByText('Rпр 4.29 ≥ 3.19')).toBeInTheDocument();
      expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();
    });

    it('климат тронут — чипы без сравнения, сводка скрыта', () => {
      renderSurface();

      fireEvent.change(climateInput('zot'), {target: {value: '210'}});
      openTab('Конструкции');

      expect(screen.getByText('Rпр 4.09')).toBeInTheDocument();
      expect(screen.queryByText('Rпр 4.09 ≥ 3.19')).not.toBeInTheDocument();
      expect(screen.queryByText(/проходит/)).not.toBeInTheDocument();
    });

    it('новые props с пересчитанным Rнорм возвращают чипы', async () => {
      const {processor} = renderSurface();

      fireEvent.change(climateInput('zot'), {target: {value: '210'}});
      openTab('Конструкции');
      expect(screen.queryByText(/проходит/)).not.toBeInTheDocument();

      await updateProps(processor, {
        general: {
          buildingType: 'Жилое многоквартирное',
          city: {value: 'moskva', label: 'Москва'},
          tot: -2.2,
          zot: 210,
          tn: -25,
          tv: 20,
          condition: 'Б',
        },
        typeConfigs: [
          {type: 'steny', label: 'Наружные стены', hasLayers: true, rnorm: 3.25, alphaV: 8.7, alphaN: 23},
        ],
      });

      openTab('Конструкции');
      expect(screen.getByText('Rпр 4.09 ≥ 3.25')).toBeInTheDocument();
      expect(screen.getByText('проходит 1 из 1')).toBeInTheDocument();
    });

    it('без rnorm у типа сравнение не показывается независимо от климата', () => {
      renderSurface({
        typeConfigs: [
          {type: 'steny', label: 'Наружные стены', hasLayers: true, alphaV: 8.7, alphaN: 23},
        ],
      });
      openTab('Конструкции');

      expect(screen.getByText('Rпр 4.09')).toBeInTheDocument();
      expect(screen.getByText('проходит 0 из 0')).toBeInTheDocument();
    });
  });

  describe('submit без клиентской блокировки', () => {
    it('полное состояние обеих вкладок уходит одним action\'ом', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);
      openTab('Конструкции');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:apply');
      expect(actions[0]!.context.general).toMatchObject({
        buildingType: 'Жилое многоквартирное',
        city: {value: 'moskva', label: 'Москва'},
        tot: -2.2,
        zot: 205,
        tn: -25,
        tv: 20,
        condition: 'Б',
      });

      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions).toHaveLength(3);
      expect(constructions[0]).toMatchObject({id: 'c-wall-1', type: 'steny'});
      expect((constructions[0]!.layers as unknown[])).toHaveLength(4);
      expect(constructions[1]).toMatchObject({subtype: 'pol_po_gruntu'});
      expect(constructions[2]).toMatchObject({rprPassport: 0.56});
    });

    it('пустая форма уходит как есть, ничего не подсвечивается', async () => {
      const {surface} = renderSurface({constructions: [], general: EMPTY_GENERAL});
      const actions = subscribeActions(surface);
      openTab('Конструкции');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      // Тип здания — дефолт из buildingTypeOptions, остальное как есть.
      expect(actions[0]!.context.general).toEqual({
        ...EMPTY_GENERAL,
        buildingType: 'Жилое многоквартирное',
      });
      expect(actions[0]!.context.constructions).toEqual([]);
    });

    it('незаполненная строка слоя не блокирует submit', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);
      openTab('Конструкции');

      fireEvent.click(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions[0]!.layers as unknown[]).toHaveLength(5);
      expect((constructions[0]!.layers as Array<Record<string, unknown>>)[4]).toMatchObject({
        material: '',
        thicknessMm: null,
      });
    });

    it('правки общих данных уезжают ближайшим submit\'ом', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      openTab('Конструкции');
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect((actions[0]!.context.general as Record<string, unknown>).tv).toBe(22);
    });

    it('без пропа general payload прежний — только constructions', async () => {
      const {surface} = renderSurface({general: undefined});
      const actions = subscribeActions(surface);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.context).not.toHaveProperty('general');
      expect(actions[0]!.context.constructions as unknown[]).toHaveLength(3);
    });
  });

  describe('автосохранение черновика (draftAction)', () => {
    const withDraft = {draftAction: 'constructions:draft'};

    function draftSurface() {
      const rendered = renderSurface(withDraft);
      const actions = subscribeActions(rendered.surface);
      openTab('Конструкции');
      return {...rendered, actions};
    }

    // Доставка action'а асинхронна — как в submit/back-тестах выше.
    async function clickAndFlush(button: HTMLElement) {
      await act(async () => {
        fireEvent.click(button);
      });
    }

    it('без пропа структурные правки не порождают action', async () => {
      const {surface} = renderSurface({draftAction: undefined});
      const actions = subscribeActions(surface);
      openTab('Конструкции');

      await clickAndFlush(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
      await clickAndFlush(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
      const removeButtons = screen.getAllByRole('button', {name: 'Удалить конструкцию'});
      await clickAndFlush(removeButtons[removeButtons.length - 1]!);

      expect(actions).toHaveLength(0);
    });

    it('добавление конструкции шлёт один черновик с полным состоянием', async () => {
      const {actions} = draftSurface();

      await clickAndFlush(screen.getByRole('button', {name: '+ Добавить конструкцию'}));

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      expect(actions[0]!.context.general).toMatchObject({tv: 20});
      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions).toHaveLength(4);
      expect(constructions[0]).toMatchObject({id: 'c-wall-1', type: 'steny'});
      // Новая пустая карточка первого типа из typeConfigs.
      expect(constructions[3]).toMatchObject({type: 'steny', layers: []});
    });

    it('удаление конструкции шлёт черновик без удалённой записи', async () => {
      const {actions} = draftSurface();

      await clickAndFlush(screen.getAllByRole('button', {name: 'Удалить конструкцию'})[0]!);

      expect(actions).toHaveLength(1);
      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions.map(entry => entry.id)).toEqual(['c-floor-1', 'c-window-1']);
    });

    it('добавление и удаление слоя шлют черновик с актуальным набором слоёв', async () => {
      const {actions} = draftSurface();

      await clickAndFlush(screen.getAllByRole('button', {name: '+ Слой'})[0]!);
      expect(actions).toHaveLength(1);
      expect(
        (actions[0]!.context.constructions as Array<Record<string, unknown>>)[0]!.layers,
      ).toHaveLength(5);

      await clickAndFlush(screen.getAllByRole('button', {name: 'Удалить слой'})[0]!);
      expect(actions).toHaveLength(2);
      expect(
        (actions[1]!.context.constructions as Array<Record<string, unknown>>)[0]!.layers,
      ).toHaveLength(4);
    });

    it('правки полей и аккордеон сами по себе черновик не шлют', async () => {
      const {actions} = draftSurface();

      await act(async () => {
        fireEvent.change(screen.getAllByLabelText('Название')[0]!, {target: {value: 'Стена А'}});
        fireEvent.change(getThicknessInputs()[1]!, {target: {value: '200'}});
      });
      await clickAndFlush(screen.getByRole('button', {name: /Стена А/}));

      expect(actions).toHaveLength(0);
    });

    it('введённый город уезжает вместе со структурной правкой', async () => {
      const {actions} = draftSurface();

      openTab('Общие данные');
      fireEvent.change(getCityInput(), {target: {value: 'Мурманск'}});
      openTab('Конструкции');
      await clickAndFlush(screen.getByRole('button', {name: '+ Добавить конструкцию'}));

      expect(actions).toHaveLength(1);
      expect(actions[0]!.context.general).toMatchObject({
        city: {value: 'Мурманск', label: 'Мурманск'},
      });
    });

    it('submit после автосейвов работает как раньше', async () => {
      const {actions} = draftSurface();

      await clickAndFlush(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
      const removeButtons = screen.getAllByRole('button', {name: 'Удалить конструкцию'});
      await clickAndFlush(removeButtons[removeButtons.length - 1]!);
      expect(actions).toHaveLength(2);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(3);
      expect(actions[2]!.name).toBe('constructions:apply');
      expect(actions[2]!.context.constructions as unknown[]).toHaveLength(3);
    });
  });
});
