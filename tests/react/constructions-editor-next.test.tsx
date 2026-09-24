import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {CONDITIONS_DRAFT_DEBOUNCE_MS, ai37Catalog} from '@ai37/a2ui-catalog-react';
import {LOOKUP_DEBOUNCE_MS} from '@ai37/a2ui-catalog-schemas';

/**
 * Наполнение общее с нынешним `ConstructionsEditor` — та же фикстура, только
 * адресованная новому рендереру: сравнивать «было / стало» на разных данных
 * бессмысленно (change constructions-editor-next). Поэтому здесь проверяется
 * не разметка, а контракт: данные, действия, автосейв, live-Rпр, подстановка
 * климата и λ, клавиатура и `aria`.
 */
function patchedMessages(propOverrides?: Record<string, unknown>) {
  const messages = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'fixtures', 'messages', 'constructions-editor-surface.json'),
      'utf8',
    ),
  ) as A2uiMessage[];
  const update = messages.find(message => 'updateComponents' in message) as any;
  const component = update.updateComponents.components[0];
  component.component = 'ConstructionsEditorNext';
  if (propOverrides) Object.assign(component, propOverrides);
  return messages;
}

function renderSurface(propOverrides?: Record<string, unknown>) {
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(patchedMessages(propOverrides));
  const surface = processor.model.getSurface('demo-surface');
  const utils = render(<A2uiSurface surface={surface as any} />);
  return {processor, surface: surface as any, ...utils};
}

function subscribeActions(surface: any) {
  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });
  return actions;
}

/**
 * Карточки на старте свёрнуты — раскрываем ту, что нужна тесту. Имя якорим
 * на начало: у меню действий карточки в имени тот же заголовок, но с
 * приставкой «Действия: ».
 */
function openCard(name: RegExp | string) {
  fireEvent.click(screen.getByRole('button', {name}));
}

/** Блок условий раскрыт по умолчанию — сворачиваем его полоской-заголовком. */
function hideConditions() {
  fireEvent.click(screen.getByRole('button', {name: /^Условия расчёта/}));
}

function cityInput() {
  return screen.getByPlaceholderText('Город из справочника');
}

function materialInput() {
  return screen.getByPlaceholderText('Материал из справочника или свой');
}

/** Поля климата ищем по расшифровке в подписи: обозначение идёт с <sub>. */
const CLIMATE_LABELS = {
  tot: /средняя темп\. отопительного периода/,
  zot: /продолжительность отопит\. периода/,
  tn: /холодной пятидневки/,
  tv: /Температура внутреннего воздуха/,
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

describe('ConstructionsEditorNext', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const respondWith = (options: unknown[]) => {
    fetchMock.mockImplementation(() => Promise.resolve({ok: true, json: async () => ({options})}));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})}));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('рендерит то же наполнение: карточки, live-чипы, счётчик', () => {
    renderSurface();

    expect(screen.getByRole('button', {name: /^Наружная стена/})).toBeInTheDocument();
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.21 < 4.20')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.56 ≥ 0.54')).toBeInTheDocument();
    expect(screen.getByText(/проходит 2 из 3/)).toBeInTheDocument();

    // Тип без слоёв — паспортное Rпр вместо таблицы слоёв.
    openCard(/^Окно двухкамерное/);
    expect(screen.getByText('Rпр по паспорту:')).toBeInTheDocument();
    expect(screen.getByText('0.56')).toBeInTheDocument();
  });

  it('подпись секции «Условия» стоит в обоих состояниях, сводка — только в свёрнутом', () => {
    renderSurface();

    // Раскрытая форма показывает те же значения полями — сводка в шапке
    // была бы их повтором.
    expect(screen.getByText('Условия')).toBeInTheDocument();
    expect(screen.queryByText(/Москва · климат по СП 131/)).not.toBeInTheDocument();

    hideConditions();

    // Подпись осталась на месте: у нынешнего рендерера она объявлена только в
    // раскрытой ветке и при сворачивании пропадает.
    expect(screen.getByText('Условия')).toBeInTheDocument();
    expect(screen.getByText(/Москва · климат по СП 131/)).toBeInTheDocument();
    // Отдельной кнопки «Показать» нет: раскрывается вся полоска-заголовок —
    // и шеврон, и титул, и сводка внутри одного триггера.
    expect(screen.queryByRole('button', {name: 'Показать'})).toBeNull();
    expect(
      screen.getByRole('button', {name: /^Условия расчёта/}).getAttribute('aria-expanded'),
    ).toBe('false');
  });

  it('раскрывашки объявляют aria-expanded и aria-controls, icon-only — aria-label', () => {
    renderSurface();

    const conditions = screen.getByRole('button', {name: /Условия расчёта/});
    expect(conditions).toHaveAttribute('aria-expanded', 'true');
    // aria-controls объявляем сами: библиотека снимает его со свёрнутого
    // триггера, а спека требует его в обоих состояниях.
    expect(document.getElementById(conditions.getAttribute('aria-controls')!)).not.toBeNull();
    hideConditions();
    expect(conditions).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(conditions.getAttribute('aria-controls')!)).not.toBeNull();

    const card = screen.getByRole('button', {name: /^Наружная стена/});
    expect(card).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(card.getAttribute('aria-controls')!)).not.toBeNull();

    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-expanded', 'true');

    // Кнопка без подписи: имя живёт в aria-label. Удаление — в меню, а не
    // голым «✕»: необратимое действие не должно попадаться под палец так же
    // легко, как раскрытие.
    expect(
      screen.getByRole('button', {name: 'Действия: Наружная стена (кирпич + минвата)'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', {name: /^Действия: /})).toHaveLength(3);
  });

  it('город выбирается с клавиатуры: ↓ подсвечивает, Enter выбирает и подставляет климат', async () => {
    renderSurface();
    respondWith([{value: 'msk', label: 'Москва', tot: -2.2, zot: 205, tn: -25}]);

    const input = cityInput();
    await typeAndFlush(input, 'мос');

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    const active = input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)).toHaveTextContent('Москва');

    fireEvent.keyDown(input, {key: 'Enter'});

    expect(cityInput()).toHaveValue('Москва');
    expect(climateInput('tot')).toHaveValue('-2,2');
    expect(climateInput('zot')).toHaveValue('205');
    expect(climateInput('tn')).toHaveValue('-25');
  });

  it('свободный текст остаётся значением поля и не блокируется', async () => {
    renderSurface();

    await typeAndFlush(cityInput(), 'Зеленоград');

    expect(cityInput()).toHaveValue('Зеленоград');
  });

  it('числовое поле меняется стрелками с шагом', () => {
    renderSurface();

    const zot = climateInput('zot');
    fireEvent.keyDown(zot, {key: 'ArrowUp'});
    expect(zot).toHaveValue('206');
    fireEvent.keyDown(zot, {key: 'ArrowDown'});
    fireEvent.keyDown(zot, {key: 'ArrowDown'});
    expect(zot).toHaveValue('204');
  });

  it('правка формы слоя пересчитывает чип Rпр мгновенно; state — по «Применить»', () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);
    openCard(/^Наружная стена/);

    // Толщина минваты (2-я строка стены): 150 → 10 — Rпр упадёт ниже Rнорм.
    fireEvent.click(screen.getByRole('button', {name: /минераловатные/}));
    fireEvent.change(screen.getByLabelText('Толщина, мм'), {target: {value: '10'}});

    expect(screen.getByText('Rпр 1.17 < 3.19')).toBeInTheDocument();
    expect(screen.getByText(/проходит 2 из 3/)).toBeInTheDocument();
    expect(actions).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', {name: 'Применить'}));

    expect(screen.getByRole('button', {name: /минераловатные.*10 мм/})).toBeInTheDocument();
    expect(screen.getByText(/проходит 1 из 3/)).toBeInTheDocument();
    expect(actions).toHaveLength(0);
  });

  it('выбор материала из справочника подставляет λ и пересчитывает Rпр', async () => {
    renderSurface();
    openCard(/^Наружная стена/);
    respondWith([
      {value: 'm-penopoliuretan', label: 'Пенополиуретан', lambdaA: 0.041, lambdaB: 0.05},
    ]);

    fireEvent.click(screen.getByRole('button', {name: /минераловатные/}));
    await typeAndFlush(materialInput(), 'пено');
    fireEvent.keyDown(materialInput(), {key: 'ArrowDown'});
    fireEvent.keyDown(materialInput(), {key: 'Enter'});

    // λ пришла с опцией и вытеснила ручную: строка-сводка показывает λБ.
    fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    expect(screen.getByRole('button', {name: /Пенополиуретан.*λ 0\.05/})).toBeInTheDocument();
  });

  it('коммит формы слоя уезжает черновиком; submit шлёт полное состояние', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);
    openCard(/^Наружная стена/);

    fireEvent.click(screen.getByRole('button', {name: /минераловатные/}));
    fireEvent.change(screen.getByLabelText('Толщина, мм'), {target: {value: '200'}});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('constructions:draft');
    const draft = actions[0]!.context as {constructions: Array<{layers: Array<{thicknessMm: number}>}>};
    expect(draft.constructions[0]!.layers[1]!.thicknessMm).toBe(200);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });
    expect(actions).toHaveLength(2);
    expect(actions[1]!.name).toBe('constructions:apply');
    expect(actions[1]!.context).toHaveProperty('general');
    expect(actions[1]!.context).toHaveProperty('constructions');
  });

  it('правка условий уезжает черновиком с дебаунсом', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);

    fireEvent.change(climateInput('tv'), {target: {value: '22'}});
    expect(actions).toHaveLength(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(CONDITIONS_DRAFT_DEBOUNCE_MS);
    });

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context as {general: {tv: number}}).general.tv).toBe(22);
  });

  it('удаление конструкции живёт в меню карточки', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);

    // Меню открывается указателем: click без pointerdown Base UI не считает
    // нажатием на триггер.
    const trigger = screen.getByRole('button', {name: /^Действия: Пол по грунту/});
    await act(async () => {
      fireEvent.pointerDown(trigger);
      fireEvent.mouseDown(trigger);
      fireEvent.click(trigger);
      await vi.advanceTimersByTimeAsync(50);
    });

    const item = screen.getByRole('menuitem', {name: 'Удалить'});
    await act(async () => {
      fireEvent.click(item);
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.queryByRole('button', {name: /^Пол по грунту/})).not.toBeInTheDocument();
    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('constructions:draft');
  });

  it('невалидная конструкция подсвечена и названа, но submit не блокирует', async () => {
    const {surface} = renderSurface();
    const actions = subscribeActions(surface);

    // Гейт условий открыт (все обязательные поля заполнены) — статусные
    // пометки на карточках есть.
    expect(screen.getAllByText(/готова|без λ|проверить/).length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });
    expect(actions).toHaveLength(1);
  });
});

/**
 * Случай со стенда теплотеха 2026-09-14: перекрытие над подвалом со всеми
 * заполненными слоями, но без выбранной разновидности показывало зелёное
 * «готова», а «Рассчитать» возвращало в чат «выберите подтип перекрытия»
 * (change constructions-missing-subtype-invalid). Слои здесь заполнены
 * намеренно: иначе карточка была бы невалидна по старой причине и тест не
 * отличил бы новую.
 */
describe('ConstructionsEditorNext: незаполненная разновидность', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const FLOOR_NAME = 'Пол 1 этажа, перекрытие над подвалом';

  /**
   * Та же фикстура: слои перекрытия дозаполнены (λ утеплителя — из справочника
   * demo), разновидность снимается или остаётся по аргументу.
   */
  function floorConstructions({subtype}: {subtype?: string}) {
    const messages = patchedMessages();
    const update = messages.find(message => 'updateComponents' in message) as any;
    const constructions = update.updateComponents.components[0].constructions as any[];
    return constructions.map(entry => {
      if (entry.id !== 'c-floor-1') return entry;
      const layers = entry.layers.map((layer: any) =>
        layer.thicknessMm === null
          ? {...layer, thicknessMm: 100, materialKey: 'm-eps', lambdaA: 0.031, lambdaB: 0.034}
          : layer,
      );
      const {subtype: _dropped, ...rest} = entry;
      return {...rest, ...(subtype ? {subtype} : {}), name: FLOOR_NAME, layers};
    });
  }

  function floorCard() {
    return screen
      .getByRole('button', {name: new RegExp(`^${FLOOR_NAME}`)})
      .closest('.a2ui-card');
  }

  it('свёрнутая карточка помечена рамкой и чипом «проверить»', () => {
    renderSurface({constructions: floorConstructions({})});

    const card = floorCard();
    expect(card).not.toBeNull();
    expect(card!.className).toContain('a2ui-card--invalid');
    // Причина названа общим «проверить»: счёт «N слоёв без λ» соврал бы —
    // слои заполнены полностью.
    expect(card!.textContent).toContain('проверить');
    expect(card!.textContent).not.toContain('без λ');
  });

  it('та же карточка с выбранной разновидностью — «готова» и без пометки рамки', () => {
    renderSurface({constructions: floorConstructions({subtype: 'podval_vent'})});

    const card = floorCard();
    expect(card!.className).not.toContain('a2ui-card--invalid');
    expect(card!.textContent).toContain('готова');
  });

  it('раскрытая карточка называет, что разновидность не выбрана', () => {
    renderSurface({constructions: floorConstructions({})});
    hideConditions();
    openCard(new RegExp(`^${FLOOR_NAME}`));

    expect(screen.getByText(/разновидность не выбрана/)).toBeInTheDocument();
  });

  it('выбранная разновидность печатается в шапке, как прежде', () => {
    renderSurface({constructions: floorConstructions({subtype: 'podval_vent'})});
    hideConditions();
    openCard(new RegExp(`^${FLOOR_NAME}`));

    expect(screen.queryByText(/разновидность не выбрана/)).not.toBeInTheDocument();
    expect(screen.getByText(/Цокольное перекрытие \(подполье вентилируемое\)/)).toBeInTheDocument();
  });

  it('тип без разновидностей: ни текста, ни разделителя перед ним', () => {
    renderSurface();
    hideConditions();
    openCard(/^Наружная стена/);

    expect(screen.queryByText(/разновидность не выбрана/)).not.toBeInTheDocument();
    expect(screen.getByText('Наружные стены')).toBeInTheDocument();
  });
});

describe('ConstructionsEditorNext: коэффициент однородности r', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const wallWithR = {
    id: 'c-wall-1',
    type: 'steny',
    name: 'Наружная стена',
    layers: [{material: 'Кирпич', thicknessMm: 380, lambdaB: 0.81}],
    r: 0.9,
  };

  it('поле r в форме шапки: до «Сохранить» ничего не меняется, после — чип, шапка и черновик', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);
    openCard(/^Наружная стена/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    // Пустое поле подсказывает, что примет система, но значением не становится.
    expect(screen.getByLabelText('r (однородность)')).toHaveAttribute('placeholder', '1');
    fireEvent.change(screen.getByLabelText('r (однородность)'), {target: {value: '0.75'}});
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(actions).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    });

    // 4.09 · 0.75 = 3.06 — стена перестаёт проходить.
    expect(screen.getByText('Rпр 3.06 < 3.19')).toBeInTheDocument();
    expect(screen.getByText(/проходит 1 из 3/)).toBeInTheDocument();
    expect(screen.getByText(/r = 0\.75/)).toBeInTheDocument();
    expect(actions).toHaveLength(1);
    const draft = actions[0]!.context as {constructions: Array<{r?: number}>};
    expect(draft.constructions[0]!.r).toBe(0.75);
  });

  it('у изделия (окно) поля r нет', () => {
    renderSurface();
    openCard(/^Окно двухкамерное/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    expect(screen.getByLabelText('Название')).toBeInTheDocument();
    expect(screen.queryByLabelText('r (однородность)')).not.toBeInTheDocument();
  });

  it('присланный r печатается в шапке и учтён в чипе; очищенное поле снимает ключ', async () => {
    const {surface} = renderSurface({
      draftAction: 'constructions:draft',
      constructions: [wallWithR],
    });
    const actions = subscribeActions(surface);

    // (1/8.7 + 0.38/0.81 + 1/23) · 0.9 = 0.56
    expect(screen.getByText('Rпр 0.56 < 3.19')).toBeInTheDocument();
    openCard(/^Наружная стена/);
    expect(screen.getByText(/r = 0\.90/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));
    fireEvent.change(screen.getByLabelText('r (однородность)'), {target: {value: ''}});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    });

    expect(screen.getByText('Rпр 0.63 < 3.19')).toBeInTheDocument();
    expect(screen.queryByText(/r = /)).not.toBeInTheDocument();
    const draft = actions[0]!.context as {constructions: Array<Record<string, unknown>>};
    expect(draft.constructions[0]).not.toHaveProperty('r');
  });
});

describe('ConstructionsEditorNext: температура помещения и поправка nt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const TV_LABEL = /температура помещения/;
  const TOT_LABEL = /температура с холодной стороны/;

  it('плейсхолдеры температур — значения здания: пустое поле значит «как у здания»', () => {
    renderSurface();
    openCard(/^Наружная стена/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    expect(screen.getByLabelText(TV_LABEL)).toHaveAttribute('placeholder', '20');
    expect(screen.getByLabelText(TOT_LABEL)).toHaveAttribute('placeholder', '-2.2');
    expect(screen.getByLabelText(TV_LABEL)).toHaveValue('');
  });

  it('tв* лестничной клетки: чип nt, норма по нему, шапка и черновик', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);
    openCard(/^Наружная стена/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    fireEvent.change(screen.getByLabelText(TV_LABEL), {target: {value: '16'}});
    // До «Сохранить» ничего не меняется — как у типа, названия и r.
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
    expect(actions).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    });

    // nt = (16 − (−2,2))/(20 − (−2,2)) = 0,82; норма 3,19 · 0,82 = 2,62.
    expect(screen.getByText('nt 0.82')).toBeInTheDocument();
    expect(screen.getByText('Rпр 4.09 ≥ 2.62')).toBeInTheDocument();
    expect(screen.getByText(/t.*в \+16 °C/)).toBeInTheDocument();
    const draft = actions[0]!.context as {constructions: Array<{tvRoom?: number}>};
    expect(draft.constructions[0]!.tvRoom).toBe(16);
  });

  it('tот* перекрытия над подвалом опускает норму, а не Rпр', async () => {
    renderSurface();
    openCard(/^Пол по грунту/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    fireEvent.change(screen.getByLabelText(TOT_LABEL), {target: {value: '8'}});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    });

    // nt = (20 − 8)/(20 − (−2,2)) = 0,54; норма 4,20 · 0,54 = 2,27.
    expect(screen.getByText('nt 0.54')).toBeInTheDocument();
    expect(screen.getByText('Rпр 0.21 < 2.27')).toBeInTheDocument();
  });

  it('без заданной температуры чипа nt нет', () => {
    renderSurface();
    expect(screen.queryByText(/^nt /)).not.toBeInTheDocument();
    expect(screen.getByText('Rпр 4.09 ≥ 3.19')).toBeInTheDocument();
  });

  it('у изделия поля температур есть: nt правит норму любого типа таблицы 3', () => {
    renderSurface();
    openCard(/^Окно двухкамерное/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));

    expect(screen.getByLabelText(TV_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(TOT_LABEL)).toBeInTheDocument();
    // r у изделия по-прежнему нет — множитель Rпр, а не нормы.
    expect(screen.queryByLabelText('r (однородность)')).not.toBeInTheDocument();
  });

  it('очищенное поле снимает ключ, чип nt уходит', async () => {
    const {surface} = renderSurface({
      draftAction: 'constructions:draft',
      constructions: [
        {
          id: 'c-wall-1',
          type: 'steny',
          name: 'Наружная стена',
          layers: [{material: 'Кирпич', thicknessMm: 380, lambdaB: 0.81}],
          tvRoom: 16,
        },
      ],
    });
    const actions = subscribeActions(surface);
    expect(screen.getByText('nt 0.82')).toBeInTheDocument();

    openCard(/^Наружная стена/);
    fireEvent.click(screen.getByRole('button', {name: 'Изменить тип и название'}));
    fireEvent.change(screen.getByLabelText(TV_LABEL), {target: {value: ''}});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить'}));
    });

    expect(screen.queryByText(/^nt /)).not.toBeInTheDocument();
    const draft = actions[0]!.context as {constructions: Array<Record<string, unknown>>};
    expect(draft.constructions[0]).not.toHaveProperty('tvRoom');
  });
});

/**
 * Вид слоя `thin` и толщина у `vent-gap`/`thin` (change
 * constructions-layer-kind-thin): строка без толщины — полная, вид виден в
 * сводке, селектор вида в форме, спец-запись справочника ставит вид сразу.
 */
describe('ConstructionsEditorNext: вид слоя thin и толщина зазоров', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  const respondWith = (options: unknown[]) => {
    fetchMock.mockImplementation(() => Promise.resolve({ok: true, json: async () => ({options})}));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn(() => Promise.resolve({ok: true, json: async () => ({options: []})}));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const thinFixture = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'fixtures', 'valid', 'constructions-editor-thin.json'),
      'utf8',
    ),
  ).props as {constructions: unknown[]; typeConfigs: unknown[]};

  const renderThin = () =>
    renderSurface({
      constructions: thinFixture.constructions,
      typeConfigs: thinFixture.typeConfigs,
      draftAction: 'constructions:draft',
    });

  /** Кнопка-раскрывашка карточки по началу заголовка. */
  const cardButton = (name: RegExp) => screen.getByRole('button', {name});

  it('облицовка вентфасада без толщины: вид под названием, «без толщины» без предупреждения, карточка готова', () => {
    renderThin();
    hideConditions();

    const card = cardButton(/^Наружная стена тип 1/).closest('.a2ui-card');
    expect(card!.className).not.toContain('a2ui-card--invalid');
    expect(card!.textContent).toContain('готова');

    openCard(/^Наружная стена тип 1/);
    const row = screen.getByRole('button', {name: /^Навесной вентилируемый фасад/});
    expect(row.textContent).toContain('вентилируемый зазор');
    expect(row.textContent).toContain('без толщины');
    expect(row.textContent).toContain('Rs — в итоговом расчёте');
    expect(row.querySelector('.a2ui-t--warning')).toBeNull();
    expect(screen.queryByText('толщина не задана')).toBeNull();
  });

  it('тонкие слои без толщины: «тонкий слой», «не учитывается», карточка не подсвечена', () => {
    renderThin();
    hideConditions();

    const card = cardButton(/^Стена тамбура/).closest('.a2ui-card');
    expect(card!.className).not.toContain('a2ui-card--invalid');

    openCard(/^Стена тамбура/);
    const adhesive = screen.getAllByRole('button', {name: /^Адгезивный слой/})[0]!;
    expect(adhesive.textContent).toContain('тонкий слой');
    expect(adhesive.textContent).toContain('без толщины');
    expect(adhesive.textContent).toContain('не учитывается');
    expect(adhesive.querySelector('.a2ui-t--warning')).toBeNull();

    // Тонкий слой с толщиной печатает её как обычно.
    const paint = screen.getByRole('button', {name: /^Акриловая краска/});
    expect(paint.textContent).toContain('2 мм');
    expect(paint.textContent).toContain('тонкий слой');
  });

  it('материал без толщины по-прежнему предупреждает: замкнутому зазору и материалу толщина нужна', () => {
    renderSurface({
      constructions: [
        {
          id: 'w',
          type: 'steny',
          name: 'Стена с пустыми строками',
          layers: [
            {material: 'Кирпич', thicknessMm: null, lambdaManual: 0.7},
            {material: 'Замкнутый зазор', thicknessMm: null, kind: 'closed-gap'},
          ],
        },
      ],
    });
    hideConditions();
    openCard(/^Стена с пустыми строками/);

    expect(screen.getAllByText('толщина не задана')).toHaveLength(2);
    expect(screen.queryByText('без толщины')).toBeNull();
  });

  it('селектор «Вид слоя»: «Тонкий слой» снимает λ, толщина не нужна, «Применить» уезжает с kind', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);
    hideConditions();
    openCard(/^Наружная стена/);

    // Фибролит: свой материал с ручной λ 0,09 и толщиной 30.
    fireEvent.click(screen.getByRole('button', {name: /Фибролит/}));
    const kindSelect = screen.getByRole('combobox', {name: 'Вид слоя'});
    expect(kindSelect.textContent).toContain('Материал');

    // Base UI Select: клик открывает список, пункт выбирается фокусом + Enter
    // (клик по пункту в jsdom не срабатывает — нужна pointer-последовательность).
    await act(async () => {
      fireEvent.click(kindSelect);
    });
    await act(async () => {
      const option = screen.getByRole('option', {name: 'Тонкий слой'});
      option.focus();
      fireEvent.keyDown(option, {key: 'Enter'});
    });

    expect(screen.getByText('не учитывается')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('не нужна')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });

    expect(actions).toHaveLength(1);
    const draft = actions[0]!.context as {
      constructions: Array<{layers: Array<{kind?: string; lambdaManual?: number; thicknessMm: number | null}>}>;
    };
    const layer = draft.constructions[0]!.layers[3]!;
    expect(layer.kind).toBe('thin');
    expect(layer.lambdaManual).toBeUndefined();
    expect(layer.thicknessMm).toBe(30);
    expect(screen.getByRole('button', {name: /Фибролит.*тонкий слой/})).toBeInTheDocument();
  });

  it('спец-запись справочника ставит вид сразу: строка не подсвечена как материал без λ', async () => {
    const {surface} = renderSurface({draftAction: 'constructions:draft'});
    const actions = subscribeActions(surface);
    hideConditions();
    openCard(/^Наружная стена/);
    respondWith([{value: 'thin', label: 'Тонкий слой (плёнка, клей, сетка)'}]);

    fireEvent.click(screen.getByRole('button', {name: /Фибролит/}));
    await typeAndFlush(materialInput(), 'тонк');
    fireEvent.keyDown(materialInput(), {key: 'ArrowDown'});
    fireEvent.keyDown(materialInput(), {key: 'Enter'});

    expect(screen.getByRole('combobox', {name: 'Вид слоя'}).textContent).toContain('Тонкий слой');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Применить'}));
    });
    const draft = actions[0]!.context as {
      constructions: Array<{layers: Array<{kind?: string; materialKey?: string}>}>;
    };
    expect(draft.constructions[0]!.layers[3]).toMatchObject({kind: 'thin', materialKey: 'thin'});
  });
});
