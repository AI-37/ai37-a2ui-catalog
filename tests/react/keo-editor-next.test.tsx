import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {CONDITIONS_DRAFT_DEBOUNCE_MS, ai37Catalog} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/**
 * Наполнение общее с нынешним `KeoEditor` — та же фикстура, только
 * адресованная новому рендереру: сравнивать «было / стало» на разных данных
 * бессмысленно (change keo-editor-next). Поэтому здесь проверяется не вёрстка
 * — её смотрят глазами, — а то, что ломается молча: контракт submit, свежесть
 * подписей, ветка `revealBy`, проход по секциям и `aria`.
 */
function keoProps() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', 'keo-editor.json'), 'utf8'),
  ).props as Record<string, unknown>;
}

/** Первый ход агента: города нет, помещение пустое. */
function firstMoveProps() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'fixtures', 'valid', 'keo-editor-first-move.json'),
      'utf8',
    ),
  ).props as Record<string, unknown>;
}

/** Наполнение с автосохранением черновика (`draftAction`). */
function draftProps() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', 'keo-editor-draft.json'), 'utf8'),
  ).props as Record<string, unknown>;
}

function updateMessage(props: Record<string, unknown>) {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'demo-surface',
      components: [{id: 'root', component: 'KeoEditorNext', ...props}],
    },
  } as unknown as A2uiMessage;
}

function renderEditor(props: Record<string, unknown>) {
  const messages: A2uiMessage[] = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    updateMessage(props),
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as any;

  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });

  const utils = render(<A2uiSurface surface={surface} />);
  return {actions, processor, ...utils};
}

/** Новый снапшот props от агента: тот же surface, обновлённый компонент. */
async function updateProps(processor: MessageProcessor<any>, props: Record<string, unknown>) {
  await act(async () => {
    processor.processMessages([updateMessage(props)]);
  });
}

/** Заголовок секции — одна кнопка: доступное имя склеивает титул и сводку. */
function sectionName(title: string) {
  return new RegExp(`^${title}`);
}

function section(title: string) {
  return screen.getByRole('button', {name: sectionName(title)});
}

function querySection(title: string) {
  return screen.queryByRole('button', {name: sectionName(title)});
}

/**
 * Шапка секции целиком: пометка стоит рядом с кнопкой-заголовком, а не внутри
 * неё (иначе попала бы в доступное имя), поэтому её ищем по общему контейнеру.
 */
function header(title: string) {
  return section(title).closest('.a2ui-card__header') as HTMLElement;
}

function isOpen(title: string) {
  return section(title).getAttribute('aria-expanded') === 'true';
}

async function flush(run: () => void) {
  await act(async () => {
    run();
  });
}

async function openSection(title: string) {
  await flush(() => {
    fireEvent.click(section(title));
  });
}

/** Помещение свёрнуто, а его секции живут внутри: открываем пару. */
async function openRoomSection(room: string, title: string) {
  await openSection(room);
  await openSection(title);
}

/**
 * Поля всех секций держатся в DOM (`keepMounted`), поэтому ищем их по имени в
 * своём экране: `getByRole` свёрнутую панель не видит, а `querySelector` видит.
 */
function fieldIn(container: HTMLElement, name: string) {
  return container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
}

/**
 * Выпадающий список Base UI открывается с клавиатуры: `↓` раскрывает попап,
 * `Enter` на пункте выбирает. Мышиное открытие в jsdom не работает — попап
 * позиционируется по layout, которого здесь нет.
 */
async function selectOption(trigger: HTMLElement, optionText: string) {
  await flush(() => {
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
  const option = screen.getAllByRole('option').find(item => item.textContent === optionText)!;
  await flush(() => {
    fireEvent.keyDown(option, {key: 'Enter'});
  });
}

/** Триггер списка внутри секции: у каждой секции свои поля-списки. */
function selectTrigger(container: HTMLElement, name: string) {
  return container
    .querySelector(`input[name="${name}"]`)!
    .closest('.a2ui-field')!
    .querySelector<HTMLElement>('.a2ui-select')!;
}

/**
 * Правка города в поле-справочнике. Ввод поднимает попап подсказок, а Base UI
 * прячет от доступного дерева всё, что вне открытого попапа, — поэтому после
 * ввода он закрывается `Escape`, иначе тестам не видно ни секций, ни подвала.
 */
async function typeCity(value: string) {
  const input = screen.getByPlaceholderText('Город');

  await flush(() => {
    fireEvent.change(input, {target: {value}});
  });
  await flush(() => {
    fireEvent.keyDown(input, {key: 'Escape'});
  });
}

/** «Далее» ведёт по секциям; жмём, пока кнопка не станет отправляющей. */
async function walkThroughSections() {
  for (let step = 0; step < 12; step += 1) {
    const next = screen.queryByRole('button', {name: 'Далее'});
    if (next === null) return;
    await flush(() => {
      fireEvent.click(next);
    });
  }

  throw new Error('«Далее» не кончается: проход по секциям зациклился');
}

const ROOM = 'Жилая комната';

describe('KeoEditorNext: состав экрана', () => {
  it('условия и помещения — секции, вкладок нет', () => {
    renderEditor(keoProps());

    expect(section('Условия')).toBeTruthy();
    expect(section(ROOM)).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Добавить помещение'})).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('помещение одно — удалять нечего', () => {
    renderEditor(keoProps());

    expect(screen.queryByRole('button', {name: /^Действия:/})).toBeNull();
  });
});

describe('KeoEditorNext: submit', () => {
  it('«Далее» ведёт по секциям и не отправляет, «Рассчитать» отправляет документ', async () => {
    const {actions} = renderEditor(keoProps());

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));
    });
    expect(actions).toHaveLength(0);

    await walkThroughSections();
    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('keo_calculate');

    const document = actions[0]!.context;
    expect(document.conditions).toEqual({region: 'Тюмень'});
    const rooms = document.rooms as Array<{name: string; values: Record<string, unknown>}>;
    expect(rooms).toHaveLength(1);
    expect(rooms[0]!.name).toBe(ROOM);
    expect(rooms[0]!.values.depth).toBe(4.5);
  });

  it('правленое условие уезжает тем же ключом, а не рядом с присланным', async () => {
    const {actions} = renderEditor(keoProps());

    await typeCity('Петербург');

    await walkThroughSections();
    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions[0]!.context.conditions).toEqual({region: 'Петербург'});
  });

  it('добавление и удаление помещения ничего не отправляют', async () => {
    const {actions} = renderEditor(keoProps());

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Добавить помещение'}));
    });
    expect(section('Помещение 2')).toBeTruthy();

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: `Действия: Помещение 2`}));
    });
    await flush(() => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Удалить помещение'}));
    });

    expect(querySection('Помещение 2')).toBeNull();
    expect(actions).toHaveLength(0);
  });
});

describe('KeoEditorNext: подписи источников', () => {
  it('правка поля снимает метку источника и пересчитывает счётчик', async () => {
    const {container} = renderEditor(keoProps());

    expect(screen.getByText(/Источники значений: /).textContent).not.toContain('изменено вами');

    await openRoomSection(ROOM, 'Геометрия помещения');
    await flush(() => {
      fireEvent.change(fieldIn(container as HTMLElement, 'depth'), {target: {value: '5'}});
    });

    expect(screen.getByText(/Источники значений: /).textContent).toContain('1 изменено вами');
  });
});

describe('KeoEditorNext: следствие условия', () => {
  it('правка города гасит строку про световой климат, значение остаётся', async () => {
    renderEditor(keoProps());

    expect(section('Условия').textContent).toContain('Тюмень');
    expect(section('Условия').textContent).toContain('группа светового климата 1');

    await typeCity('Петербург');

    // Группу по Прил. Е знает агент; до его ответа компонент про климат
    // молчит, а не повторяет расчёт для прежнего города.
    expect(section('Условия').textContent).toContain('Петербург');
    expect(section('Условия').textContent).not.toContain('группа светового климата');
  });
});

describe('KeoEditorNext: незаполненное условие', () => {
  it('города нет — раскрыты условия, а не помещение, и у них «заполните»', () => {
    renderEditor(firstMoveProps());

    expect(isOpen('Условия')).toBe(true);
    expect(isOpen('Помещение 1')).toBe(false);
    expect(header('Условия').textContent).toContain('заполните');
  });

  it('город заполнен — раскрывается первая секция помещения', () => {
    const props = firstMoveProps();
    const conditions = (props.conditions as Array<Record<string, unknown>>).map(condition => ({
      ...condition,
      value: 'Тюмень',
    }));

    renderEditor({...props, conditions});

    expect(isOpen('Условия')).toBe(false);
    expect(header('Условия').textContent).not.toContain('заполните');
    expect(isOpen('Помещение 1')).toBe(true);
    expect(isOpen('Назначение')).toBe(true);
  });

  it('стёртый пользователем город возвращает пометку, экран не перескакивает', async () => {
    const props = firstMoveProps();
    const conditions = (props.conditions as Array<Record<string, unknown>>).map(condition => ({
      ...condition,
      value: 'Тюмень',
    }));

    renderEditor({...props, conditions});
    expect(isOpen('Помещение 1')).toBe(true);

    await typeCity('');

    expect(header('Условия').textContent).toContain('заполните');
    // Раскрытие пересевается только на новом снапшоте props — правка условия
    // экран не перекладывает.
    expect(isOpen('Помещение 1')).toBe(true);
  });

  it('без conditionsLabel пустое условие целью не становится', async () => {
    // Наполнение полное — незаполнен только город: если бы блок без заголовка
    // попадал в цели, «Далее» висело бы на нём вечно и не отдало бы кнопку
    // «Рассчитать».
    const {conditionsLabel, ...props} = keoProps();
    const conditions = (props.conditions as Array<Record<string, unknown>>).map(condition => ({
      ...condition,
      value: '',
    }));
    const {actions} = renderEditor({...props, conditions});

    // Блок без заголовка стоит раскрытым: пометку рисовать негде, и «Далее»
    // не должно висеть на цели, которой нет среди секций.
    expect(querySection('Условия')).toBeNull();
    await walkThroughSections();
    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
  });
});

describe('KeoEditorNext: revealBy', () => {
  it('ветка затенения появляется и исчезает по полю-триггеру', async () => {
    const {container} = renderEditor(keoProps());
    const root = container as HTMLElement;
    const branch = ['distance', 'front', 'opposingHeight', 'facadeReflection', 'floor'];

    await openRoomSection(ROOM, 'Затенение');
    expect(branch.every(name => fieldIn(root, name) !== null)).toBe(true);

    await selectOption(selectTrigger(root, 'opposing'), 'Нет — открытый горизонт');
    expect(branch.every(name => fieldIn(root, name) === null)).toBe(true);

    await selectOption(selectTrigger(root, 'opposing'), 'Есть — здание напротив (схема N1)');
    expect(branch.every(name => fieldIn(root, name) !== null)).toBe(true);
  });
});

describe('KeoEditorNext: подписи задаёт агент', () => {
  it('без nextLabel кнопка подвала одна — та, что отправляет', async () => {
    const {nextLabel, ...props} = keoProps();
    const {actions} = renderEditor(props);

    expect(screen.queryByRole('button', {name: 'Далее'})).toBeNull();

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('keo_calculate');
  });

  it('без conditionsLabel условия стоят открытым блоком без заголовка', () => {
    const {conditionsLabel, ...props} = keoProps();
    renderEditor(props);

    expect(querySection('Условия')).toBeNull();
    // Блок на месте: поле города видно без раскрывания.
    expect(screen.getByPlaceholderText('Город')).toBeTruthy();
  });
});

describe('KeoEditorNext: черновик', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ROOM_1 = 'Помещение 1';
  const GEOMETRY = 'Геометрия помещения';

  async function tick(ms: number) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  it('серия правок схлопывается в одну отправку', async () => {
    const {actions, container} = renderEditor(draftProps());
    const root = container as HTMLElement;

    // Поля живут в DOM и у свёрнутой секции (`keepMounted`) — раскрывать её
    // незачем: раскрытие само по себе черновик не шлёт.
    for (const value of ['5', '6', '7']) {
      await act(async () => {
        fireEvent.change(fieldIn(root, 'depth'), {target: {value}});
      });
    }
    expect(actions).toHaveLength(0);

    await tick(CONDITIONS_DRAFT_DEBOUNCE_MS);

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('keo:draft');
    const rooms = actions[0]!.context.rooms as Array<{values: Record<string, unknown>}>;
    expect(rooms[0]!.values.depth).toBe(7);
  });

  it('добавление помещения уходит сразу, без паузы', async () => {
    const {actions} = renderEditor(draftProps());

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Добавить помещение'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('keo:draft');
    expect((actions[0]!.context.rooms as unknown[]).length).toBe(2);
  });

  it('раскрытие секции не отправляет ничего', async () => {
    const {actions} = renderEditor(draftProps());

    await act(async () => {
      fireEvent.click(section(ROOM_1));
    });
    await tick(CONDITIONS_DRAFT_DEBOUNCE_MS);

    expect(actions).toHaveLength(0);
  });

  it('без draftAction правки не уезжают никуда', async () => {
    const {draftAction, ...props} = draftProps();
    const {actions, container} = renderEditor(props);

    await act(async () => {
      fireEvent.change(fieldIn(container as HTMLElement, 'depth'), {target: {value: '5'}});
    });
    await tick(CONDITIONS_DRAFT_DEBOUNCE_MS);

    expect(actions).toHaveLength(0);
  });

  it('ответ на черновик не сбрасывает состояние экрана', async () => {
    const {actions, container, processor} = renderEditor(draftProps());
    const root = container as HTMLElement;

    await openRoomSection(ROOM_1, GEOMETRY);
    await act(async () => {
      fireEvent.change(fieldIn(root, 'depth'), {target: {value: '5'}});
    });
    await tick(CONDITIONS_DRAFT_DEBOUNCE_MS);
    expect(actions).toHaveLength(1);
    expect(screen.getByText(/Источники значений: /).textContent).toContain('1 изменено вами');

    // Агент кладёт черновик в состояние задачи и отвечает снапшотом на месте:
    // те же значения, пересчитанное следствие условия.
    const draft = actions[0]!.context as {rooms: Array<{values: Record<string, unknown>}>};
    await updateProps(processor, {
      ...draftProps(),
      rooms: draft.rooms,
      conditions: [
        {
          ...(draftProps().conditions as Array<Record<string, unknown>>)[0],
          note: 'группа светового климата 1 — пересчитано',
        },
      ],
    });

    expect(isOpen(ROOM_1)).toBe(true);
    expect(isOpen(GEOMETRY)).toBe(true);
    expect(screen.getByText(/Источники значений: /).textContent).toContain('1 изменено вами');
    expect(section('Условия').textContent).toContain('пересчитано');
  });

  it('новое сообщение агента по-прежнему пересевает состояние', async () => {
    const {container, processor} = renderEditor(draftProps());
    const root = container as HTMLElement;

    await openRoomSection(ROOM_1, GEOMETRY);
    await act(async () => {
      fireEvent.change(fieldIn(root, 'depth'), {target: {value: '5'}});
    });

    // Другой документ — не ответ на черновик: значения помещения другие.
    await updateProps(processor, {...draftProps(), rooms: [{values: {depth: 9}}]});

    expect(fieldIn(root, 'depth').value).toBe('9');
    expect(isOpen(ROOM_1)).toBe(false);
    expect(screen.getByText(/Источники значений: /).textContent).not.toContain('изменено вами');
  });
});

describe('KeoEditorNext: подпись условия при автосохранении', () => {
  it('с draftAction следствие не гаснет, а заменяется присланным', async () => {
    const {processor} = renderEditor(draftProps());

    expect(section('Условия').textContent).toContain('группа светового климата 1');

    await typeCity('Петербург');

    // Гасить незачем: пересчитанное следствие придёт ответом на черновик.
    expect(section('Условия').textContent).toContain('Петербург');
    expect(section('Условия').textContent).toContain('группа светового климата 1');

    await updateProps(processor, {
      ...draftProps(),
      conditions: [
        {
          ...(draftProps().conditions as Array<Record<string, unknown>>)[0],
          value: 'Петербург',
          note: 'группа светового климата 3 — C_N = 1,00 для любой ориентации',
        },
      ],
    });

    expect(section('Условия').textContent).toContain('группа светового климата 3');
  });
});

describe('KeoEditorNext: клавиатура и aria', () => {
  it('свёрнутая секция — кнопка с aria-expanded и aria-controls на свою панель', () => {
    const {container} = renderEditor(keoProps());

    const trigger = section(ROOM);
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    const panelId = trigger.getAttribute('aria-controls')!;
    expect(panelId).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(panelId)}`)).toBeTruthy();
  });

  it('два экрана на странице не делят id панелей', () => {
    renderEditor(keoProps());
    renderEditor(keoProps());

    const ids = screen
      .getAllByRole('button', {name: sectionName(ROOM)})
      .map(trigger => trigger.getAttribute('aria-controls'));

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
