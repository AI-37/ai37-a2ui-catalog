import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {LOOKUP_DEBOUNCE_MS, LOOKUP_SUGGEST_ROUTE} from '@ai37/a2ui-catalog-schemas';
import {
  CONDITIONS_DRAFT_DEBOUNCE_MS,
  ai37Catalog,
  resolveLayerLambda,
} from '@ai37/a2ui-catalog-react';

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

/** Карточки на старте свёрнуты — раскрываем ту, что нужна тесту. */
function openCard(name: RegExp | string) {
  fireEvent.click(screen.getByRole('button', {name}));
}

/** Клик по строке-сводке слоя раскрывает его форму (ищем по материалу). */
function openLayerRow(name: RegExp) {
  fireEvent.click(screen.getByRole('button', {name}));
}

/** «Изменить» у шапки: aria-label отличает её от кнопки паспортного Rпр. */
function openHeaderForm(index = 0) {
  fireEvent.click(screen.getAllByRole('button', {name: 'Изменить тип и название'})[index]!);
}

function openPassportForm(index = 0) {
  fireEvent.click(screen.getAllByRole('button', {name: 'Изменить Rпр по паспорту'})[index]!);
}

/** Инпут названия существует только в раскрытой форме шапки — она одна. */
function nameInput() {
  return screen.getByLabelText('Название');
}

function passportInput() {
  return screen.getByRole('spinbutton', {name: /Rпр по паспорту/});
}

/** Строки-сводки слоёв всех раскрытых карточек. */
function layerSummaries() {
  // Строку слоя ищем по её классу: порядковых номеров в разметке больше нет,
  // а материал у черновой строки может быть пустым.
  return [...document.querySelectorAll('.a2ui-ce-layer')];
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

/**
 * Поля климата ищем по расшифровке в подписи (обозначение идёт с <sub>); tв
 * переехало в основную сетку условий и подписано по-другому.
 */
const CLIMATE_LABELS = {
  tot: /средняя темп\. отопительного периода/,
  zot: /продолжительность отопит\. периода/,
  tn: /холодной пятидневки/,
  tv: /Температура внутреннего воздуха/,
} as const;

function climateInput(key: keyof typeof CLIMATE_LABELS) {
  return screen.getByLabelText(CLIMATE_LABELS[key]);
}

/** Блок условий свёрнут — раскрываем его для тестов, которые смотрят в поля. */
function showConditions() {
  // Раскрывает вся строка-сводка: имя кнопки — весь её текст.
  fireEvent.click(screen.getByRole('button', {name: /Показать/}));
}

/** Поле ГСОП ряда климата: подпись + значение, ввода в нём нет. */
function gsopField() {
  return screen.getByText(/ГСОП — градусо-сутки/).closest('div')!;
}

/** Поле условий целиком (подпись + контрол + подпись источника). */
function conditionsField(label: RegExp | string) {
  return screen.getByLabelText(label).closest('label')!;
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

    // Три карточки с чипами: стена проходит, пол по грунту (без 1/αн) — нет,
    // окно по паспортному Rпр — проходит. Всё это видно свёрнутым.
    expect(screen.getByText('Наружная стена (кирпич + минвата)')).toBeInTheDocument();
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.21 < 4.20')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.56 ≥ 0.54')).toBeInTheDocument();
    expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();
    expect(screen.queryAllByPlaceholderText('Материал из справочника или свой')).toHaveLength(0);

    // Тип без слоёв — паспортное Rпр текстом вместо таблицы слоёв.
    openCard(/Окно двухкамерное/);
    expect(screen.getByText('Rпр по паспорту:')).toBeInTheDocument();
    expect(screen.getByText('0.56')).toBeInTheDocument();
    expect(screen.queryAllByRole('spinbutton', {name: /Rпр по паспорту/})).toHaveLength(0);

    // Зазор — без ввода λ, подсказка про серверный Rs (в строке-сводке).
    openCard(/Наружная стена/);
    expect(screen.getByText('Rs — в итоговом расчёте')).toBeInTheDocument();

    // Слои раскрытой карточки — строки-сводки с источником λ, ни одной формы.
    // accessible name склеивает вложенный значок: «λ 0.81авто».
    expect(screen.getByRole('button', {name: /380 мм.*λ 0\.81авто/})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Фибролит.*λ 0\.09/})).toBeInTheDocument();
    expect(screen.queryAllByPlaceholderText('Материал из справочника или свой')).toHaveLength(0);
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

  it('правка в форме слоя попадает в state по «Применить»; до коммита live-Rпр прежний', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);
    openCard(/Наружная стена/);

    // Толщина минваты (2-я строка стены): 150 → 10 — Rпр упадёт ниже Rнорм.
    openLayerRow(/минераловатные/);
    fireEvent.change(getThicknessInputs()[0]!, {target: {value: '10'}});

    // До «Применить» правка живёт только в форме: чип и сводка не тронуты.
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

    // Форма закрыта, строка-сводка и live-Rпр показывают новую толщину.
    expect(screen.getByRole('button', {name: /минераловатные.*10 мм/})).toBeInTheDocument();
    expect(screen.getByText('Rпр 1.17 < 3.19')).toBeInTheDocument();
    expect(screen.getByText('проходит 1 из 3')).toBeInTheDocument();
    expect(actions).toHaveLength(0);
  });

  it('«Добавить» и «Удалить слой» меняют список мгновенно, без action\'ов и сети', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);
    openCard(/Наружная стена/);
    const initialRows = layerSummaries().length;

    // «+ Слой» открывает форму, state ещё прежний; слой появляется по коммиту.
    fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));
    expect(layerSummaries()).toHaveLength(initialRows);
    fireEvent.click(screen.getByRole('button', {name: 'Добавить'}));
    expect(layerSummaries()).toHaveLength(initialRows + 1);

    // Удаление — из открытой формы слоя.
    openLayerRow(/материал не указан/);
    fireEvent.click(screen.getByRole('button', {name: 'Удалить слой'}));
    expect(layerSummaries()).toHaveLength(initialRows);

    expect(actions).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('add/remove конструкции; смена типа на «без слоёв» показывает паспортное Rпр', () => {
    renderSurface();

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
    // Новая карточка первого типа из typeConfigs ("Наружные стены"), сразу
    // раскрытая — её добавили, чтобы заполнить. Шапка при этом в режиме чтения.
    expect(screen.getAllByRole('button', {name: 'Удалить конструкцию'})).toHaveLength(4);
    expect(screen.queryAllByRole('combobox', {name: 'Тип конструкции'})).toHaveLength(0);

    // Смена типа новой карточки на окна (hasLayers: false) фиксируется по
    // коммиту: до «Сохранить» карточка живёт прежним типом.
    openHeaderForm();
    fireEvent.change(screen.getByRole('combobox', {name: 'Тип конструкции'}), {
      target: {value: 'okna'},
    });
    expect(screen.queryByText('Rпр по паспорту:')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    expect(screen.getAllByText('Rпр по паспорту:')).toHaveLength(1);

    const removeButtons = screen.getAllByRole('button', {name: 'Удалить конструкцию'});
    fireEvent.click(removeButtons[removeButtons.length - 1]!);
    expect(screen.getAllByRole('button', {name: 'Удалить конструкцию'})).toHaveLength(3);
  });

  it('lookup формы слоя: выбор опции с λ заполняет materialKey и λ («авто»)', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          options: [{value: 'm-beton-b25', label: 'Бетон B25', lambdaA: 1.7, lambdaB: 1.86}],
        }),
      }),
    );
    renderSurface();
    openCard(/Наружная стена/);

    fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));
    const materialInput = getMaterialInputs()[0]!; // единственная открытая форма

    await typeAndFlush(materialInput, 'бет');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      `${LOOKUP_SUGGEST_ROUTE}?${new URLSearchParams({resource: 'sp50-materials', query: 'бет'})}`,
    );

    fireEvent.mouseDown(screen.getByRole('option', {name: 'Бетон B25'}));

    expect((materialInput as HTMLInputElement).value).toBe('Бетон B25');
    // condition Б → λБ из опции («авто»), ручного ввода λ в форме нет.
    expect(screen.getByText('1.86')).toBeInTheDocument();
    expect(screen.queryAllByRole('spinbutton', {name: /λ.*вручную/})).toHaveLength(0);

    // Коммит «Добавить» переносит выбор в строку-сводку.
    fireEvent.click(screen.getByRole('button', {name: 'Добавить'}));
    expect(screen.getByRole('button', {name: /Бетон B25.*λ 1\.86авто/})).toBeInTheDocument();
  });

  it('свободный текст без выбора опции — ручная λ', async () => {
    renderSurface();
    openCard(/Наружная стена/);

    fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));

    await typeAndFlush(getMaterialInputs()[0]!, 'самодельный утеплитель');

    // Строка без λ из справочника → ручной ввод в форме.
    expect(screen.getAllByRole('spinbutton', {name: /λ.*вручную/})).toHaveLength(1);
  });

  it('аккордеон: карточки свёрнуты, раскрытие показывает строки слоёв, чип виден всегда', () => {
    renderSurface();

    expect(layerSummaries()).toHaveLength(0);
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();

    openCard(/Наружная стена/);
    expect(layerSummaries()).toHaveLength(4);

    openCard(/Наружная стена/);
    expect(layerSummaries()).toHaveLength(0);
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
  });

  describe('форма слоя', () => {
    it('раскрыта максимум одна форма; переключение строки отбрасывает правки', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openLayerRow(/минераловатные/);
      fireEvent.change(getThicknessInputs()[0]!, {target: {value: '999'}});

      // Клик по другой строке переводит форму туда, правки №2 отброшены.
      openLayerRow(/Фибролит/);
      expect(getMaterialInputs()).toHaveLength(1);
      expect((getMaterialInputs()[0] as HTMLInputElement).value).toBe('Фибролит (нестандартный)');
      expect(screen.getByRole('button', {name: /минераловатные.*150 мм/})).toBeInTheDocument();
      expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    });

    it('форма одна на весь редактор: открытие в другой карточке закрывает первую', () => {
      renderSurface();
      openCard(/Наружная стена/);
      openCard(/Пол по грунту/);

      openLayerRow(/минераловатные/);
      expect(getMaterialInputs()).toHaveLength(1);

      openLayerRow(/Железобетон/);
      expect(getMaterialInputs()).toHaveLength(1);
      expect((getMaterialInputs()[0] as HTMLInputElement).value).toBe('Железобетон');
    });

    it('«Отмена» закрывает форму без следа', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openLayerRow(/Фибролит/);
      fireEvent.change(getThicknessInputs()[0]!, {target: {value: '999'}});
      fireEvent.click(screen.getByRole('button', {name: 'Отмена'}));

      expect(screen.getByRole('button', {name: /Фибролит.*30 мм/})).toBeInTheDocument();
      expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    });

    it('«+ Слой» с «Отменой» не оставляет пустой строки', () => {
      renderSurface();
      openCard(/Наружная стена/);

      fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));
      // Пока форма нового слоя открыта, кнопки «+ Слой» нет.
      expect(screen.queryByRole('button', {name: '+ Слой'})).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {name: 'Отмена'}));

      expect(layerSummaries()).toHaveLength(4);
      expect(screen.getByRole('button', {name: '+ Слой'})).toBeInTheDocument();
    });
  });

  describe('шапка карточки', () => {
    it('по умолчанию текст: тип с разновидностью и название, контролов нет', () => {
      renderSurface();
      openCard(/Пол по грунту/);

      expect(
        screen.getByText('Чердачные и цокольные перекрытия, полы · Пол по грунту'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
      expect(screen.queryAllByRole('combobox', {name: 'Тип конструкции'})).toHaveLength(0);
      expect(screen.getAllByRole('button', {name: 'Изменить тип и название'})).toHaveLength(1);
    });

    it('ввод в форме не трогает карточку до «Сохранить»', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openHeaderForm();
      fireEvent.change(nameInput(), {target: {value: 'Стена А'}});

      // Заголовок-аккордеон продолжает показывать название из state.
      expect(screen.getByRole('button', {name: /Наружная стена/})).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: /Стена А/})).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));

      // Форма закрыта, новое название и в заголовке, и в режиме чтения.
      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: /Стена А/})).toBeInTheDocument();
      expect(screen.getAllByText('Стена А')).toHaveLength(2);
    });

    it('«Отмена» и «Сохранить» без изменений не меняют состояния', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openHeaderForm();
      fireEvent.change(nameInput(), {target: {value: 'Стена Б'}});
      fireEvent.click(screen.getByRole('button', {name: 'Отмена'}));

      expect(screen.queryByText('Стена Б')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: /Наружная стена/})).toBeInTheDocument();

      openHeaderForm();
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));

      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: /Наружная стена/})).toBeInTheDocument();
    });

    it('форма одна на весь редактор: шапка и слой вытесняют друг друга', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openLayerRow(/минераловатные/);
      fireEvent.change(getThicknessInputs()[0]!, {target: {value: '999'}});

      // Открытие шапки закрывает форму слоя, её правки отброшены.
      openHeaderForm();
      expect(screen.queryAllByPlaceholderText('Материал из справочника или свой')).toHaveLength(0);
      expect(screen.getByRole('button', {name: /минераловатные.*150 мм/})).toBeInTheDocument();

      // И наоборот: клик по строке слоя закрывает форму шапки.
      openLayerRow(/Фибролит/);
      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
      expect(getMaterialInputs()).toHaveLength(1);
    });
  });

  describe('паспортное Rпр', () => {
    it('«Применить» обновляет значение и live-Rпр; до коммита чип прежний', () => {
      renderSurface();
      openCard(/Окно двухкамерное/);

      openPassportForm();
      fireEvent.change(passportInput(), {target: {value: '0.8'}});
      expect(screen.getByText('Rпр 0.56 ≥ 0.54')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.getByText('0.80')).toBeInTheDocument();
      expect(screen.getByText('Rпр 0.80 ≥ 0.54')).toBeInTheDocument();
    });

    it('«Отмена» не оставляет следа', () => {
      renderSurface();
      openCard(/Окно двухкамерное/);

      openPassportForm();
      fireEvent.change(passportInput(), {target: {value: '0.8'}});
      fireEvent.click(screen.getByRole('button', {name: 'Отмена'}));

      expect(screen.getByText('0.56')).toBeInTheDocument();
      expect(screen.getByText('Rпр 0.56 ≥ 0.54')).toBeInTheDocument();
    });

    it('незаполненное значение показано предупреждением', () => {
      renderSurface({
        constructions: [{id: 'w-1', type: 'okna', name: 'Окно без паспорта', layers: []}],
      });
      openCard(/Окно без паспорта/);

      expect(screen.getByText('не задано')).toBeInTheDocument();
    });
  });

  describe('подсветка невалидной конструкции', () => {
    it('валидные данные фикстуры — пометки «проверить» нет', () => {
      renderSurface();

      expect(screen.queryByText('проверить')).not.toBeInTheDocument();
    });

    it('появляется по коммиту слоя без λ и гаснет после исправления, без action\'ов', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);
      openCard(/Наружная стена/);

      // Стираем ручную λ фибролита и коммитим — карточка невалидна; все
      // проблемы одного вида «нет λ», поэтому чип называет счёт.
      openLayerRow(/Фибролит/);
      fireEvent.change(screen.getByRole('spinbutton', {name: /λ.*вручную/}), {
        target: {value: ''},
      });
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.getByText('1 слой без λ')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /Фибролит.*λ не задана/})).toBeInTheDocument();

      // Пометка видна и на свернутой карточке.
      openCard(/Наружная стена/);
      expect(screen.getByText('1 слой без λ')).toBeInTheDocument();

      // Исправление гасит подсветку само, никаких action'ов не было.
      openCard(/Наружная стена/);
      openLayerRow(/Фибролит/);
      fireEvent.change(screen.getByRole('spinbutton', {name: /λ.*вручную/}), {
        target: {value: '0.09'},
      });
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.queryByText('1 слой без λ')).not.toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('тип без слоёв: нет паспортного Rпр — карточка помечена', () => {
      renderSurface({
        constructions: [{id: 'w-1', type: 'okna', name: 'Окно без паспорта', layers: []}],
      });

      expect(screen.getByText('проверить')).toBeInTheDocument();
    });
  });

  describe('статусные чипы карточек (construction-status-chips)', () => {
    // Полные условия фикстуры — гейт чипов открыт.
    const FULL_GENERAL = {
      buildingType: 'Жилое многоквартирное',
      city: {value: 'moskva', label: 'Москва'},
      tot: -2.2,
      zot: 205,
      tn: -25,
      tv: 20,
      condition: 'Б',
    };

    const VALID_LAYERS = [
      {material: 'Кладка из кирпича', thicknessMm: 380, lambdaA: 0.7, lambdaB: 0.81},
      {material: 'Плиты минераловатные', thicknessMm: 150, lambdaA: 0.045, lambdaB: 0.048},
    ];

    function presetWall(overrides?: Record<string, unknown>) {
      return {
        id: 'p-wall',
        type: 'steny',
        name: 'Типовая стена',
        layers: VALID_LAYERS,
        status: 'confirm',
        ...overrides,
      };
    }

    it('пустые условия — статусных чипов нет ни на одной карточке', () => {
      renderSurface({general: EMPTY_GENERAL, constructions: [presetWall()]});

      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();
      expect(screen.queryByText('готова')).not.toBeInTheDocument();
      expect(screen.queryByText('проверить')).not.toBeInTheDocument();
    });

    it('условия дозаполнили — чипы появились тем же рендером, без хода агента', () => {
      renderSurface({
        general: {...FULL_GENERAL, tv: null},
        constructions: [presetWall()],
      });
      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();

      fireEvent.change(climateInput('tv'), {target: {value: '20'}});

      expect(screen.getByText('подтвердите')).toBeInTheDocument();
    });

    it('tн в гейт не входит: без неё чипы уже рендерятся', () => {
      renderSurface({
        general: {...FULL_GENERAL, tn: null},
        constructions: [presetWall()],
      });

      expect(screen.getByText('подтвердите')).toBeInTheDocument();
    });

    it('палитра и приоритет: проблемы данных → агентский статус → готова', () => {
      renderSurface({
        general: FULL_GENERAL,
        constructions: [
          // Статус + невалидный слой: виден только чип проблем данных.
          presetWall({
            id: 'c-1',
            name: 'Стена с дефектом',
            layers: [{material: 'Минвата', thicknessMm: 150}],
          }),
          presetWall({id: 'c-2', name: 'Полный пресет'}),
          presetWall({id: 'c-3', name: 'Готовая', status: undefined}),
          {
            id: 'c-4',
            type: 'okna',
            name: 'Окно из текста',
            layers: [],
            rprPassport: 0.83,
            status: 'confirm-passport',
          },
        ],
      });

      expect(screen.getByText('1 слой без λ')).toBeInTheDocument();
      expect(screen.getByText('подтвердите')).toBeInTheDocument();
      expect(screen.getByText('готова')).toBeInTheDocument();
      expect(screen.getByText('подтвердите паспорт')).toBeInTheDocument();
    });

    it('однородные «нет λ» считаются, смешанные проблемы — общий «проверить»', () => {
      renderSurface({
        general: FULL_GENERAL,
        constructions: [
          presetWall({
            id: 'c-lambda',
            name: 'Два слоя без λ',
            status: undefined,
            layers: [
              {material: 'Минвата', thicknessMm: 150},
              {material: 'Кирпич', thicknessMm: 380},
            ],
          }),
          presetWall({
            id: 'c-mixed',
            name: 'Смешанные проблемы',
            status: undefined,
            layers: [
              {material: 'Минвата', thicknessMm: 150},
              {material: 'Кирпич', thicknessMm: null, lambdaB: 0.81},
            ],
          }),
        ],
      });

      expect(screen.getByText('2 слоя без λ')).toBeInTheDocument();
      expect(screen.getByText('проверить')).toBeInTheDocument();
    });

    it('раскрытие полной карточки гасит статус — карточка становится «готова»', () => {
      const {surface} = renderSurface({general: FULL_GENERAL, constructions: [presetWall()]});
      const actions = subscribeActions(surface);

      openCard(/Типовая стена/);

      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();
      expect(screen.getByText('готова')).toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('непроходящая по Rпр, но полная — раскрытие тоже гасит', () => {
      renderSurface({
        general: FULL_GENERAL,
        constructions: [
          presetWall({
            name: 'Тонкая стена',
            layers: [{material: 'Кирпич', thicknessMm: 380, lambdaB: 0.81}],
          }),
        ],
      });

      openCard(/Тонкая стена/);

      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();
      expect(screen.getByText('готова')).toBeInTheDocument();
      // Красный чип Rпр остаётся: непрохождение нормы — легитимный результат.
      expect(screen.getByText(/Rпр .*<.*3\.19/)).toBeInTheDocument();
    });

    it('раскрытие карточки с ошибками данных статус не гасит', () => {
      renderSurface({
        general: FULL_GENERAL,
        constructions: [
          presetWall({
            name: 'Стена с дефектом',
            layers: [{material: 'Минвата', thicknessMm: 150}],
          }),
        ],
      });

      openCard(/Стена с дефектом/);
      // Приоритет у чипа проблем данных; статус жив: после починки слоя без
      // повторного просмотра карточка снова просит подтверждения.
      expect(screen.getByText('1 слой без λ')).toBeInTheDocument();

      openCard(/Стена с дефектом/); // свернуть — просмотр с ошибками не подтвердил
      expect(screen.getByText('1 слой без λ')).toBeInTheDocument();
      expect(screen.queryByText('готова')).not.toBeInTheDocument();
    });

    it('коммит правки слоя равен подтверждению', () => {
      renderSurface({
        general: FULL_GENERAL,
        constructions: [
          presetWall({
            name: 'Стена с дефектом',
            layers: [{material: 'Минвата', thicknessMm: 150}],
          }),
        ],
      });

      openCard(/Стена с дефектом/);
      expect(screen.queryByText('готова')).not.toBeInTheDocument();

      openLayerRow(/Минвата/);
      fireEvent.change(screen.getByRole('spinbutton', {name: /λ.*вручную/}), {
        target: {value: '0.05'},
      });
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();
      expect(screen.getByText('готова')).toBeInTheDocument();
    });
  });

  describe('двухрежимная кнопка (calc-button-next-label)', () => {
    const FULL_GENERAL = {
      buildingType: 'Жилое многоквартирное',
      city: {value: 'moskva', label: 'Москва'},
      tot: -2.2,
      zot: 205,
      tn: -25,
      tv: 20,
      condition: 'Б',
    };

    const PRESET = {
      id: 'p-wall',
      type: 'steny',
      name: 'Типовая стена',
      layers: [
        {material: 'Кладка из кирпича', thicknessMm: 380, lambdaA: 0.7, lambdaB: 0.81},
        {material: 'Плиты минераловатные', thicknessMm: 150, lambdaA: 0.045, lambdaB: 0.048},
      ],
      status: 'confirm',
    };

    it('без пропа pendingLabel поведение прежнее: submit даже при пометках', async () => {
      const {surface} = renderSurface({general: EMPTY_GENERAL, constructions: [PRESET]});
      const actions = subscribeActions(surface);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:apply');
    });

    it('условия пусты: «Далее» раскрывает блок условий, action не уходит', () => {
      const {surface} = renderSurface({
        pendingLabel: 'Далее',
        general: EMPTY_GENERAL,
        conditionsCollapsed: true,
        constructions: [PRESET],
      });
      const actions = subscribeActions(surface);
      expect(screen.queryByRole('button', {name: 'Рассчитать'})).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));

      // Блок условий раскрыт — поля видны; ни одна карточка не раскрыта.
      expect(getCityInput()).toBeInTheDocument();
      expect(layerSummaries()).toHaveLength(0);
      expect(actions).toHaveLength(0);
    });

    it('условия заполнены: «Далее» раскрывает первую требующую внимания карточку', () => {
      const {surface} = renderSurface({
        pendingLabel: 'Далее',
        general: FULL_GENERAL,
        constructions: [
          {...PRESET, id: 'p-1', name: 'Первый пресет'},
          {...PRESET, id: 'p-2', name: 'Второй пресет'},
        ],
      });
      const actions = subscribeActions(surface);

      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));

      // Первая карточка раскрыта (слои видны) и подтверждена просмотром;
      // вторая ждёт своей очереди со статусом.
      expect(layerSummaries().length).toBeGreaterThan(0);
      expect(screen.getByText('готова')).toBeInTheDocument();
      expect(screen.getByText('подтвердите')).toBeInTheDocument();
      expect(actions).toHaveLength(0);

      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));

      expect(screen.queryByText('подтвердите')).not.toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('последняя пометка погашена — подпись меняется на submitLabel тем же рендером', () => {
      renderSurface({
        pendingLabel: 'Далее',
        general: FULL_GENERAL,
        constructions: [PRESET],
      });
      expect(screen.getByRole('button', {name: 'Далее'})).toBeInTheDocument();

      openCard(/Типовая стена/);

      expect(screen.queryByRole('button', {name: 'Далее'})).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Рассчитать'})).toBeInTheDocument();
    });

    it('чистый список: «Рассчитать» шлёт apply с полным состоянием, как раньше', async () => {
      const {surface} = renderSurface({pendingLabel: 'Далее'});
      const actions = subscribeActions(surface);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:apply');
      expect(actions[0]!.context).toHaveProperty('general');
      expect(actions[0]!.context).toHaveProperty('constructions');
    });
  });

  describe('блок «Условия» вместо вкладок', () => {
    it('оба блока видны сразу, переключателя вкладок нет', () => {
      renderSurface();

      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(getCityInput()).toHaveValue('Москва');
      expect(screen.getByText('Наружная стена (кирпич + минвата)')).toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Рассчитать'})).toBeInTheDocument();
      expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();
    });

    it('старые пропы вкладок не рисуются', () => {
      renderSurface({
        generalTabLabel: 'Общие данные',
        constructionsTabLabel: 'Конструкции',
        nextLabel: 'К конструкциям',
      });

      expect(screen.queryAllByRole('tab')).toHaveLength(0);
      expect(screen.queryByRole('button', {name: 'К конструкциям'})).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: 'Далее'})).not.toBeInTheDocument();
    });

    it('сворачивание локально: action\'ов нет, введённое переживает его', () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

      openCard(/Наружная стена/);
      openHeaderForm();
      fireEvent.change(nameInput(), {target: {value: 'Стена А'}});
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});

      // Свернули и раскрыли — правка на месте, наверх ничего не ушло.
      fireEvent.click(screen.getByRole('button', {name: 'Свернуть'}));
      expect(screen.queryByLabelText(CLIMATE_LABELS.tv)).not.toBeInTheDocument();
      showConditions();

      expect(climateInput('tv')).toHaveValue(22);
      expect(screen.getByRole('button', {name: /Стена А/})).toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('conditionsCollapsed задаёт начальное состояние блока', () => {
      renderSurface({conditionsCollapsed: true});

      expect(screen.queryByPlaceholderText('Город из справочника')).not.toBeInTheDocument();
      expect(screen.getByText('Условия расчёта')).toBeInTheDocument();

      showConditions();
      expect(getCityInput()).toHaveValue('Москва');
    });

    it('сводка свёрнутой строки собрана из значений и следует за правкой', () => {
      renderSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '21'}});
      fireEvent.click(screen.getByRole('button', {name: 'Свернуть'}));

      expect(
        screen.getByText('Москва · климат по СП 131 · tв +21 °C · условия Б'),
      ).toBeInTheDocument();
    });

    it('пустое значение не попадает в сводку', () => {
      renderSurface({general: {...EMPTY_GENERAL, tv: 20}, conditionsCollapsed: true});

      // Ни города, ни климата — только tв и условия по умолчанию.
      expect(screen.getByText('tв +20 °C · условия Б')).toBeInTheDocument();
    });

    it('шапка карточки рисуется только с headerTitle', () => {
      const {unmount} = renderSurface({
        headerTitle: 'Параметры расчёта',
        headerContext: 'Проект «ЖК Северный, к.3» · СП 50.13330',
      });

      expect(screen.getByText('Параметры расчёта')).toBeInTheDocument();
      expect(screen.getByText('Проект «ЖК Северный, к.3» · СП 50.13330')).toBeInTheDocument();
      unmount();

      renderSurface({headerContext: 'Проект «ЖК Северный, к.3»'});
      expect(screen.queryByText('Проект «ЖК Северный, к.3»')).not.toBeInTheDocument();
    });

    it('ГСОП — поле ряда климата: значение от агента, без пересчёта на клиенте', () => {
      renderSurface({
        general: {
          buildingType: 'Жилое многоквартирное',
          city: {value: 'tyumen', label: 'Тюмень'},
          tot: -6.4,
          zot: 218,
          tn: -35,
          tv: 20,
          condition: 'Б',
          gsop: 6380,
        },
      });

      // Значение с неразрывным пробелом в разрядах — ищем по началу числа.
      expect(gsopField().textContent).toMatch(/6.380/);
      // Поле не редактируется: ввода в нём нет.
      expect(gsopField().querySelector('input')).toBeNull();

      // Правка климата значение не прячет: прежний ГСОП живёт до нового
      // снапшота агента (constructions-editor-live-draft).
      fireEvent.change(climateInput('tot'), {target: {value: '-7'}});
      expect(gsopField().textContent).toMatch(/6.380/);
    });

    it('без ГСОП поле остаётся на месте с прочерком, в регионе его нет', () => {
      renderSurface();

      expect(gsopField().textContent).toContain('—');
      expect(conditionsField(/Регион строительства/).textContent).not.toContain('ГСОП');
    });

    it('климат правится в отдельном ряду и уходит в submit', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

      fireEvent.change(climateInput('tot'), {target: {value: '-3.1'}});
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect((actions[0]!.context.general as Record<string, unknown>).tot).toBe(-3.1);
    });

    it('без пропа general блока условий нет — прежний экран конструкций', () => {
      renderSurface({general: undefined});

      expect(screen.queryByPlaceholderText('Город из справочника')).not.toBeInTheDocument();
      expect(screen.queryByText('Условия расчёта')).not.toBeInTheDocument();
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

  describe('provenance полей условий', () => {
    const SOURCES = {
      city: {source: 'project'},
      tv: {source: 'suggested', note: 'норма для жилых по ГОСТ 30494'},
      buildingType: {source: 'question'},
      condition: {source: 'default', note: 'условия Б, как на сервере'},
    };

    /** Оформление — это классы контрола: проверяем то, к чему цепляется CSS. */
    function controlClass(label: RegExp | string) {
      return screen.getByLabelText(label).className;
    }

    it('оформление и подпись по каждому источнику', () => {
      renderSurface({generalSources: SOURCES});

      // project — заливка без акцента, подпись названием источника.
      expect(controlClass(/Регион строительства/)).toContain('a2ui-ce-control--project');
      expect(conditionsField(/Регион строительства/).textContent).toContain('из проекта');

      // suggested — акцентная рамка и обоснование агента под контролом.
      expect(controlClass(/Температура внутреннего воздуха/)).toContain(
        'a2ui-ce-control--suggested',
      );
      expect(conditionsField(/Температура внутреннего воздуха/).textContent).toContain(
        'норма для жилых по ГОСТ 30494',
      );

      // question без note — только название источника, без пустого хвоста.
      expect(controlClass(/Назначение помещений/)).toContain('a2ui-ce-control--suggested');
      expect(conditionsField(/Назначение помещений/).textContent).toContain('из вопроса');

      // default — обычный контрол, источник виден подписью с маркером.
      expect(controlClass(/Условия эксплуатации/)).toBe('a2ui-ce-control');
      expect(conditionsField(/Условия эксплуатации/).textContent).toContain(
        'условия Б, как на сервере',
      );
    });

    it('без generalSources подписей и акцентов нет', () => {
      renderSurface();

      expect(controlClass(/Регион строительства/)).toBe('a2ui-ce-control');
      expect(conditionsField(/Регион строительства/).textContent).not.toContain('из проекта');
    });

    it('источник ничего не блокирует: поле из проекта правится', async () => {
      const {surface} = renderSurface({generalSources: SOURCES});
      const actions = subscribeActions(surface);

      fireEvent.change(getCityInput(), {target: {value: 'Мурманск'}});
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(getCityInput()).not.toBeDisabled();
      expect(actions[0]!.context.general).toMatchObject({
        city: {value: 'Мурманск', label: 'Мурманск'},
      });
    });

    it('правка снимает подпись и акцент только у тронутого поля', () => {
      renderSurface({generalSources: SOURCES});

      fireEvent.change(climateInput('tv'), {target: {value: '21'}});

      const tvField = conditionsField(/Температура внутреннего воздуха/);
      expect(controlClass(/Температура внутреннего воздуха/)).toBe('a2ui-ce-control');
      expect(tvField.textContent).not.toContain('ГОСТ 30494');

      // Соседние поля не тронуты — их подписи на месте.
      expect(conditionsField(/Регион строительства/).textContent).toContain('из проекта');
      expect(conditionsField(/Назначение помещений/).textContent).toContain('из вопроса');
      expect(conditionsField(/Условия эксплуатации/).textContent).toContain('условия Б');
    });

    it('новые props возвращают оформление: набор тронутых полей сбрасывается', async () => {
      const {processor} = renderSurface({generalSources: SOURCES});

      fireEvent.change(climateInput('tv'), {target: {value: '21'}});
      expect(controlClass(/Температура внутреннего воздуха/)).toBe('a2ui-ce-control');

      await updateProps(processor, {
        general: {
          buildingType: 'Жилое многоквартирное',
          city: {value: 'moskva', label: 'Москва'},
          tot: -2.2,
          zot: 205,
          tn: -25,
          tv: 21,
          condition: 'Б',
        },
        generalSources: SOURCES,
      });

      expect(controlClass(/Температура внутреннего воздуха/)).toContain(
        'a2ui-ce-control--suggested',
      );
    });

    it('источники не уходят в payload submit и draft', async () => {
      const {surface} = renderSurface({generalSources: SOURCES, draftAction: 'constructions:draft'});
      const actions = subscribeActions(surface);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(2);
      for (const action of actions) {
        expect(action.context).not.toHaveProperty('generalSources');
        expect(Object.keys(action.context).sort()).toEqual(['constructions', 'general']);
        expect(action.context.general).not.toHaveProperty('source');
      }
    });
  });

  describe('адаптив по ширине контейнера', () => {
    /**
     * jsdom не считает раскладку: реальную ширину колонок проверить нечем.
     * Проверяем механизм — правила приходят стилевым слоем пакета, пороги
     * заданы контейнером, а не окном, и фиксированных ширин в разметке нет.
     */
    function editorCss() {
      // React 19 поднимает тег в <head>, переписывая href/precedence в data-*
      // на клиенте; на сервере атрибуты остаются как есть. Ключ несёт хэш
      // содержимого, поэтому ищем по префиксу.
      const tag = document.head.querySelector(
        'style[data-href^="a2ui-constructions-editor"], style[href^="a2ui-constructions-editor"]',
      );
      return tag?.textContent ?? '';
    }

    it('стилевой слой приезжает сам, без импорта CSS хостом', () => {
      renderSurface();

      expect(editorCss()).toContain('.a2ui-ce {');
      expect(editorCss()).toContain('container-type: inline-size');
    });

    it('корень объявляет ширину: контейнер не схлопывается во флекс-хосте', () => {
      renderSurface();
      const root = document.querySelector('.a2ui-ce')!;
      const rule = editorCss().split('.a2ui-ce__header')[0]!;

      // container-type: inline-size обнуляет вклад содержимого в intrinsic-
      // ширину: во флекс-хосте (.a2ui-surface { display: flex }) без явной
      // ширины flex-basis: auto резолвится в 0 и карточка схлопывается в рамки.
      // jsdom раскладку не считает — проверяем контракт правила.
      expect(root).not.toBeNull();
      expect(rule).toContain('container-type: inline-size');
      expect(rule).toContain('width: 100%');
      expect(rule).toContain('min-width: 0');
    });

    it('палитра блока наследует общие токены каталога (тема хоста, в т.ч. тёмная)', () => {
      renderSurface();

      // Хост темизирует каталог через --a2ui-color-*; группа ce читает их
      // вторым фолбэком, поэтому отдельного маппинга у хоста не требует.
      expect(editorCss()).toContain(
        'var(--a2ui-color-ce-surface, var(--a2ui-color-surface, #fafaf9))',
      );
      expect(editorCss()).toContain(
        'var(--a2ui-color-ce-text, var(--a2ui-color-text-strong, #1f1f1e))',
      );
    });

    it('раскладка зависит от контейнера, а не от окна', () => {
      renderSurface();
      const css = editorCss();

      // Ни одного viewport-запроса: компонент живёт в чат-колонке, ширина
      // которой от размера окна не выводится.
      expect(css).not.toContain('@media');
      expect(css).toContain('@container a2ui-ce (min-width: 560px)');

      // Многоколоночные сетки объявлены только внутри контейнерного запроса —
      // базовая раскладка одноколоночная (деградация без поддержки @container).
      const [base, wide] = css.split('@container');
      expect(base).not.toContain('grid-template-columns');
      expect(wide).toContain('.a2ui-ce-conditions__grid');
      expect(wide).toContain('.a2ui-ce-pair');
    });

    it('фиксированной колонки в разметке нет — компонент занимает контейнер', () => {
      const {container} = renderSurface();
      openCard(/Наружная стена/);

      const styled = Array.from(container.querySelectorAll('[style]'));
      for (const element of styled) {
        expect(element.getAttribute('style')).not.toMatch(/(max-)?width:\s*\d+px/);
      }
      expect(editorCss()).not.toContain('max-width: 420px');
    });
  });

  describe('поля блока условий', () => {
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
        `${LOOKUP_SUGGEST_ROUTE}?${new URLSearchParams({resource: 'cities', query: 'ново'})}`,
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
      expect(screen.getByLabelText('Назначение помещений')).toHaveValue('Жилое многоквартирное');

      // Пустой выбор остаётся доступным.
      fireEvent.change(screen.getByLabelText('Назначение помещений'), {target: {value: ''}});
      expect(screen.getByLabelText('Назначение помещений')).toHaveValue('');
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

      fireEvent.change(screen.getByLabelText('Условия эксплуатации'), {target: {value: 'А'}});

      // λА вместо λБ: 1/8.7 + 1/23 + 0.38/0.7 + 0.15/0.045 + 0.03/0.09 = 4.37.
      expect(screen.getByText('Rпр 4.37 ≥ 3.19')).toBeInTheDocument();
    });
  });

  describe('чипы Rнорм и правки климата', () => {
    it('климат не тронут — сравнение и сводка на месте', () => {
      renderSurface();
      openCard(/Наружная стена/);

      openLayerRow(/минераловатные/);
      fireEvent.change(getThicknessInputs()[0]!, {target: {value: '160'}});
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.getByText('Rпр 4.29 ≥ 3.19')).toBeInTheDocument();
      expect(screen.getByText('проходит 2 из 3')).toBeInTheDocument();
    });

    it('климат тронут — чипы без сравнения, сводка скрыта', () => {
      renderSurface();

      fireEvent.change(climateInput('zot'), {target: {value: '210'}});

      expect(screen.getByText('Rпр 4.09')).toBeInTheDocument();
      expect(screen.queryByText('Rпр 4.09 ≥ 3.19')).not.toBeInTheDocument();
      expect(screen.queryByText(/проходит/)).not.toBeInTheDocument();
    });

    it('новые props с пересчитанным Rнорм возвращают чипы', async () => {
      const {processor} = renderSurface();

      fireEvent.change(climateInput('zot'), {target: {value: '210'}});
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

      expect(screen.getByText('Rпр 4.09 ≥ 3.25')).toBeInTheDocument();
      expect(screen.getByText('проходит 1 из 1')).toBeInTheDocument();
    });

    it('без rnorm у типа сравнение не показывается независимо от климата', () => {
      renderSurface({
        typeConfigs: [
          {type: 'steny', label: 'Наружные стены', hasLayers: true, alphaV: 8.7, alphaN: 23},
        ],
      });

      expect(screen.getByText('Rпр 4.09')).toBeInTheDocument();
      expect(screen.getByText('проходит 0 из 0')).toBeInTheDocument();
    });
  });

  describe('submit без клиентской блокировки', () => {
    it('полное состояние обеих вкладок уходит одним action\'ом', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);

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

      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });

      expect(actions).toHaveLength(1);
      // Тип здания — дефолт из buildingTypeOptions, остальное как есть.
      expect(actions[0]!.context.general).toEqual({
        ...EMPTY_GENERAL,
        buildingType: 'Жилое многоквартирное',
        // Условие эксплуатации по умолчанию — Б: сервер трактует null так же,
        // а пустой селект показывал бы «—» вместо значения, с которым считают.
        condition: 'Б',
        // ГСОП клиент не считает — в состоянии он null, пока агент не пришлёт.
        gsop: null,
      });
      expect(actions[0]!.context.constructions).toEqual([]);
    });

    it('незаполненный закоммиченный слой не блокирует submit', async () => {
      const {surface} = renderSurface();
      const actions = subscribeActions(surface);
      openCard(/Наружная стена/);

      // «Добавить» с пустой формой — слой-черновик попадает в state как есть.
      fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));
      fireEvent.click(screen.getByRole('button', {name: 'Добавить'}));
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
      return {...rendered, actions};
    }

    // Доставка action'а асинхронна — как в submit/back-тестах выше.
    async function clickAndFlush(button: HTMLElement) {
      await act(async () => {
        fireEvent.click(button);
      });
    }

    it('без пропа коммиты не порождают action', async () => {
      const {surface} = renderSurface({draftAction: undefined});
      const actions = subscribeActions(surface);

      await clickAndFlush(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
      await clickAndFlush(screen.getByRole('button', {name: '+ Слой'}));
      await clickAndFlush(screen.getByRole('button', {name: 'Добавить'}));
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

    it('коммиты «Добавить» и «Удалить слой» шлют черновик с актуальным набором слоёв', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      // «+ Слой» открывает форму без черновика; черновик — по коммиту.
      fireEvent.click(screen.getByRole('button', {name: '+ Слой'}));
      expect(actions).toHaveLength(0);
      await clickAndFlush(screen.getByRole('button', {name: 'Добавить'}));
      expect(actions).toHaveLength(1);
      expect(
        (actions[0]!.context.constructions as Array<Record<string, unknown>>)[0]!.layers,
      ).toHaveLength(5);

      openLayerRow(/материал не указан/);
      await clickAndFlush(screen.getByRole('button', {name: 'Удалить слой'}));
      expect(actions).toHaveLength(2);
      expect(
        (actions[1]!.context.constructions as Array<Record<string, unknown>>)[0]!.layers,
      ).toHaveLength(4);
    });

    it('«Применить» с изменёнными полями шлёт один черновик с введённой λ', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      openLayerRow(/Фибролит/);
      fireEvent.change(screen.getByRole('spinbutton', {name: /λ.*вручную/}), {
        target: {value: '0.05'},
      });
      expect(actions).toHaveLength(0); // ввод в форме черновика не порождает
      await clickAndFlush(screen.getByRole('button', {name: 'Применить'}));

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      const layers = (actions[0]!.context.constructions as Array<Record<string, unknown>>)[0]!
        .layers as Array<Record<string, unknown>>;
      expect(layers[3]).toMatchObject({lambdaManual: 0.05});
    });

    it('«Применить» без изменений черновик не шлёт', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      openLayerRow(/Фибролит/);
      await clickAndFlush(screen.getByRole('button', {name: 'Применить'}));

      // Форма закрыта, action'ов нет.
      expect(screen.getByRole('button', {name: /Фибролит/})).toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('ввод в незакоммиченных формах, «Отмена» и аккордеон черновик не шлют', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      openHeaderForm();
      await act(async () => {
        fireEvent.change(nameInput(), {target: {value: 'Стена А'}});
      });
      openLayerRow(/минераловатные/);
      await act(async () => {
        fireEvent.change(getThicknessInputs()[0]!, {target: {value: '200'}});
      });
      await clickAndFlush(screen.getByRole('button', {name: 'Отмена'}));
      // Название не закоммичено — заголовок прежний.
      await clickAndFlush(screen.getByRole('button', {name: /Наружная стена/}));

      expect(actions).toHaveLength(0);
    });

    it('«Сохранить» шапки с изменёнными полями шлёт один черновик', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      openHeaderForm();
      fireEvent.change(nameInput(), {target: {value: 'Стена А'}});
      expect(actions).toHaveLength(0); // ввод в форме черновика не порождает
      await clickAndFlush(screen.getByRole('button', {name: 'Сохранить'}));

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions[0]).toMatchObject({id: 'c-wall-1', name: 'Стена А'});
    });

    it('«Сохранить» шапки без изменений черновик не шлёт', async () => {
      const {actions} = draftSurface();
      openCard(/Наружная стена/);

      openHeaderForm();
      await clickAndFlush(screen.getByRole('button', {name: 'Сохранить'}));

      expect(screen.queryByLabelText('Название')).not.toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('«Применить» паспортного Rпр шлёт черновик с введённым значением', async () => {
      const {actions} = draftSurface();
      openCard(/Окно двухкамерное/);

      openPassportForm();
      fireEvent.change(passportInput(), {target: {value: '0.8'}});
      expect(actions).toHaveLength(0);
      await clickAndFlush(screen.getByRole('button', {name: 'Применить'}));

      expect(actions).toHaveLength(1);
      const constructions = actions[0]!.context.constructions as Array<Record<string, unknown>>;
      expect(constructions[2]).toMatchObject({id: 'c-window-1', rprPassport: 0.8});
    });

    it('«Применить» паспортного Rпр без изменений черновик не шлёт', async () => {
      const {actions} = draftSurface();
      openCard(/Окно двухкамерное/);

      openPassportForm();
      await clickAndFlush(screen.getByRole('button', {name: 'Применить'}));

      expect(screen.getByText('0.56')).toBeInTheDocument();
      expect(actions).toHaveLength(0);
    });

    it('введённый город уезжает вместе со структурной правкой', async () => {
      const {actions} = draftSurface();

      fireEvent.change(getCityInput(), {target: {value: 'Мурманск'}});
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

  describe('живой автодрафт условий (constructions-editor-live-draft)', () => {
    function draftSurface(overrides?: Record<string, unknown>) {
      const rendered = renderSurface({draftAction: 'constructions:draft', ...overrides});
      const actions = subscribeActions(rendered.surface);
      return {...rendered, actions};
    }

    /** Пауза ввода: окно дебаунса истекло, отложенный draft ушёл. */
    async function flushDraftDebounce() {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(CONDITIONS_DRAFT_DEBOUNCE_MS);
      });
    }

    it('серия правок без пауз схлопывается в один action со всеми значениями', async () => {
      const {actions} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      fireEvent.change(climateInput('tot'), {target: {value: '-3.5'}});
      fireEvent.change(climateInput('zot'), {target: {value: '210'}});
      expect(actions).toHaveLength(0); // окно ещё не истекло

      await flushDraftDebounce();

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      // Последний ввод побеждает: payload собран из state на момент отправки.
      expect(actions[0]!.context.general).toMatchObject({tv: 22, tot: -3.5, zot: 210});
      expect(Object.keys(actions[0]!.context).sort()).toEqual(['constructions', 'general']);
    });

    it('правки с паузой длиннее окна — два action\'а, второй с обоими значениями', async () => {
      const {actions} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      await flushDraftDebounce();
      expect(actions).toHaveLength(1);

      fireEvent.change(climateInput('tot'), {target: {value: '-3.5'}});
      await flushDraftDebounce();

      expect(actions).toHaveLength(2);
      expect(actions[1]!.context.general).toMatchObject({tv: 22, tot: -3.5});
    });

    it('submit до истечения окна отменяет отложенный draft', async () => {
      const {actions} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
      });
      await flushDraftDebounce();

      // Ушёл только submit с полным состоянием — draft после него опасен:
      // его запоздавший ответ визуально «откатил» бы форму.
      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:apply');
      expect(actions[0]!.context.general).toMatchObject({tv: 22});
    });

    it('структурная правка шлёт draft сразу и снимает отложенный', async () => {
      const {actions} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      await act(async () => {
        fireEvent.click(screen.getByRole('button', {name: '+ Добавить конструкцию'}));
      });
      await flushDraftDebounce();

      // Немедленный draft уже унёс полное состояние, включая правку условий.
      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      expect(actions[0]!.context.general).toMatchObject({tv: 22});
      expect(actions[0]!.context.constructions as unknown[]).toHaveLength(4);
    });

    it('unmount до истечения окна — draft не уходит', async () => {
      const {actions, unmount} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      unmount();
      await flushDraftDebounce();

      expect(actions).toHaveLength(0);
    });

    it('выбор города из lookup: город и автозаполненный климат одним action\'ом', async () => {
      fetchMock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            options: [{value: 'novosibirsk', label: 'Новосибирск', tot: -6.4, zot: 218, tn: -33}],
          }),
        }),
      );
      const {actions} = draftSurface();

      await typeAndFlush(getCityInput(), 'ново');
      fireEvent.mouseDown(screen.getByRole('option', {name: 'Новосибирск'}));
      await flushDraftDebounce();

      expect(actions).toHaveLength(1);
      expect(actions[0]!.name).toBe('constructions:draft');
      expect(actions[0]!.context.general).toMatchObject({
        city: {value: 'novosibirsk', label: 'Новосибирск'},
        tot: -6.4,
        zot: 218,
        tn: -33,
      });
    });

    it('кнопка сохранения условий не рендерится ни в каком состоянии', async () => {
      const {actions} = draftSurface();
      expect(screen.queryByRole('button', {name: 'Сохранить'})).not.toBeInTheDocument();

      // Правка кнопку не показывает — черновик уезжает сам.
      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      expect(screen.queryByRole('button', {name: 'Сохранить'})).not.toBeInTheDocument();

      await flushDraftDebounce();

      expect(screen.queryByRole('button', {name: 'Сохранить'})).not.toBeInTheDocument();
      expect(actions).toHaveLength(1);
    });

    it('без draftAction правки условий не шлют ничего — уедут submit\'ом', async () => {
      const {surface} = renderSurface({draftAction: undefined});
      const actions = subscribeActions(surface);

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      await flushDraftDebounce();

      expect(actions).toHaveLength(0);
      expect(screen.queryByRole('button', {name: 'Сохранить'})).not.toBeInTheDocument();
    });

    it('replace-снапшот приносит новый ГСОП, введённые поля не затираются', async () => {
      const {processor} = draftSurface();

      fireEvent.change(climateInput('tv'), {target: {value: '22'}});
      await flushDraftDebounce();

      // Ответ агента на draft: echo введённого tv + пересчитанный ГСОП.
      await updateProps(processor, {
        draftAction: 'constructions:draft',
        general: {
          buildingType: 'Жилое многоквартирное',
          city: {value: 'moskva', label: 'Москва'},
          tot: -2.2,
          zot: 205,
          tn: -25,
          tv: 22,
          condition: 'Б',
          gsop: 4961,
        },
      });

      expect(gsopField().textContent).toMatch(/4.961/);
      expect(climateInput('tv')).toHaveValue(22);
      expect(climateInput('tot')).toHaveValue(-2.2);
    });
  });
});
