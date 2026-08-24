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
