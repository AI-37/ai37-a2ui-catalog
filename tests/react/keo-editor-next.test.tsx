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

function renderEditor(props: Record<string, unknown>) {
  const messages: A2uiMessage[] = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'KeoEditorNext', ...props}],
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
