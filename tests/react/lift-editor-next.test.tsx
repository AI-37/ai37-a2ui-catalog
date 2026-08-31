import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, LIFT_DRAFT_DEBOUNCE_MS} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

/** Автосейв в фикстурах не задан: черновики проверяются с явным `draftAction`. */
const DRAFT_ACTION = 'lift:draft';

/**
 * Наполнение общее с нынешним `LiftEditor` — те же фикстуры, только
 * адресованные новому рендереру: сравнивать «было / стало» на разных данных
 * бессмысленно (change lift-editor-next). Поэтому здесь проверяется не
 * разметка, а контракт: состав формы обеих методик, перестройка на клиенте,
 * зависимые ряды, черновик и submit.
 */
function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function perLiftProps() {
  return readProps('lift-editor-per-lift.json');
}

function groupProps() {
  return readProps('lift-editor-group.json');
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

  const actions: Array<{name: string; context: Record<string, unknown>}> = [];
  surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
    actions.push(action);
  });

  const utils = render(<A2uiSurface surface={surface} />);
  return {actions, processor, ...utils};
}

/**
 * Заголовок секции — одна кнопка: доступное имя склеивает титул и сводку.
 * `(?!\d)` не даёт «Лифт 1» захватить «Лифт 10».
 */
function sectionName(title: string) {
  return new RegExp(`^${title}(?!\\d)`);
}

function section(title: string) {
  return screen.getByRole('button', {name: sectionName(title)});
}

function querySection(title: string) {
  return screen.queryByRole('button', {name: sectionName(title)});
}

function openSection(title: string) {
  fireEvent.click(section(title));
}

/**
 * Панель секции: `keepMounted` держит поля всех секций в DOM, поэтому поле
 * ищется в своей секции, а не по всему экрану — `H0` их два.
 */
function sectionPanel(title: string) {
  return section(title).closest('.a2ui-card') as HTMLElement;
}

/** Поле секции по имени: подпись несёт обозначение и расшифровку. */
function fieldIn(title: string, name: string) {
  return sectionPanel(title).querySelector<HTMLInputElement>(`[name="${name}"]`)!;
}

async function flush(run: () => void) {
  await act(async () => {
    run();
  });
}

/**
 * Выпадающий список Base UI открывается с клавиатуры: `↓` раскрывает попап,
 * клик по пункту выбирает. Мышиное открытие в jsdom не работает — попап
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

/** Переключатель методики в шапке — меню с триггером-ссылкой. */
async function switchMethod(triggerText: RegExp, itemText: string) {
  await flush(() => {
    fireEvent.click(screen.getByRole('button', {name: triggerText}));
  });
  await flush(() => {
    fireEvent.click(screen.getByRole('menuitem', {name: itemText}));
  });
}

describe('LiftEditorNext: две методики', () => {
  it('per-lift: здание и лифты, добавление и удаление на месте', () => {
    renderEditor(perLiftProps());

    expect(section('Здание')).toBeTruthy();
    expect(section('Лифт 1')).toBeTruthy();
    expect(section('Лифт 2')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Добавить лифт'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Удалить лифт 1'})).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('group: одна секция группы, добавления и удаления нет', () => {
    renderEditor(groupProps());

    expect(section('Здание')).toBeTruthy();
    expect(section('Лифтовая группа')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Добавить лифт'})).toBeNull();
    expect(screen.queryByRole('button', {name: /^Удалить лифт/})).toBeNull();
  });

  it('добавление лифта раскрывает новую секцию', async () => {
    renderEditor({...perLiftProps(), draftAction: DRAFT_ACTION});

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Добавить лифт'}));
    });

    expect(section('Лифт 3')).toBeTruthy();
    expect(section('Лифт 3').getAttribute('aria-expanded')).toBe('true');
  });

  it('удаление лифта убирает секцию', async () => {
    renderEditor({...perLiftProps(), draftAction: DRAFT_ACTION});

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт 2'}));
    });

    expect(querySection('Лифт 2')).toBeNull();
    expect(section('Лифт 1')).toBeTruthy();
    // Последний лифт не удаляется: документ без лифтов — не расчёт.
    expect(screen.queryByRole('button', {name: /^Удалить лифт/})).toBeNull();
  });
});

describe('LiftEditorNext: переключение методики', () => {
  it('форма перестраивается на клиенте, значения прежней ветки живы', async () => {
    renderEditor(perLiftProps());

    openSection('Лифт 1');
    await flush(() => {
      fireEvent.change(fieldIn('Лифт 1', 'H0'), {target: {value: '12'}});
    });

    await switchMethod(/^ГОСТ Р 52941-2008/, 'ГОСТ 34758-2021 (офисы, гостиницы, жилые)');

    // Ветка группы: своя секция и свои поля, добавления лифта нет.
    expect(section('Лифтовая группа')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Добавить лифт'})).toBeNull();
    expect(querySection('Лифт 1')).toBeNull();

    await switchMethod(/^ГОСТ 34758-2021/, 'ГОСТ Р 52941-2008 (жилые здания)');

    openSection('Лифт 1');
    expect(fieldIn('Лифт 1', 'H0').value).toBe('12');
    expect(fieldIn('Лифт 1', 'Q')).toBeTruthy();
  });

  it('наружу уезжает черновик вновь выбранной ветки, сразу', async () => {
    const {actions} = renderEditor({...perLiftProps(), draftAction: DRAFT_ACTION});

    await switchMethod(/^ГОСТ Р 52941-2008/, 'ГОСТ 34758-2021 (офисы, гостиницы, жилые)');

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe(DRAFT_ACTION);
    expect(actions[0]!.context.method).toBe('34758');
  });
});

describe('LiftEditorNext: черновик', () => {
  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('правка поля уезжает одним черновиком после паузы', async () => {
    const {actions} = renderEditor({...perLiftProps(), draftAction: DRAFT_ACTION});

    await flush(() => {
      fireEvent.change(fieldIn('Здание', 'A'), {target: {value: '341'}});
    });
    await flush(() => {
      fireEvent.change(fieldIn('Здание', 'A'), {target: {value: '342'}});
    });
    expect(actions).toHaveLength(0);

    await act(async () => {
      vi.advanceTimersByTime(LIFT_DRAFT_DEBOUNCE_MS);
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe(DRAFT_ACTION);
    expect((actions[0]!.context.building as Record<string, unknown>).A).toBe(342);
  });

  it('структурное действие шлёт черновик немедленно и отменяет отложенный', async () => {
    const {actions} = renderEditor({...perLiftProps(), draftAction: DRAFT_ACTION});

    await flush(() => {
      fireEvent.change(fieldIn('Здание', 'A'), {target: {value: '341'}});
    });
    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Добавить лифт'}));
    });

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context.lifts as unknown[])).toHaveLength(3);

    await act(async () => {
      vi.advanceTimersByTime(LIFT_DRAFT_DEBOUNCE_MS);
    });

    // Отложенный отменён: немедленный черновик уже нёс полное состояние.
    expect(actions).toHaveLength(1);
  });

  it('без draftAction черновиков нет вовсе', async () => {
    const {actions} = renderEditor(perLiftProps());

    await flush(() => {
      fireEvent.change(fieldIn('Здание', 'A'), {target: {value: '341'}});
    });
    await act(async () => {
      vi.advanceTimersByTime(LIFT_DRAFT_DEBOUNCE_MS);
    });

    expect(actions).toHaveLength(0);
  });
});

describe('LiftEditorNext: зависимые ряды', () => {
  it('смена типа здания пересобирает значения и сбрасывает несовместимое', async () => {
    renderEditor(groupProps());

    const group = 'Лифтовая группа';

    // Ряд Прил. Е выбранного типа здания: у офиса ширина 1200 есть, у жилого нет.
    await flush(() => {
      fireEvent.change(fieldIn(group, 'doorWidth'), {target: {value: '1200'}});
    });
    expect(fieldIn(group, 'tOst').value).toBe('10.3');

    // Триггер списка — кнопка-combobox в секции «Здание»: полей-списков там одно.
    const kind = within(sectionPanel('Здание')).getAllByRole('combobox')[0]!;
    await selectOption(kind, 'Жилое');
    expect(fieldIn('Здание', 'buildingType').value).toBe('Жилое');

    // Строки «Жилое · 1200» в наполнении нет — зависимое значение снято
    // (`onNoMatch: clear`), а не оставлено протухшим.
    expect(fieldIn(group, 'tOst').value).toBe('');
  });
});

describe('LiftEditorNext: submit', () => {
  it('«Далее» ведёт по секциям и не отправляет, «Рассчитать» отправляет активную ветку', async () => {
    const {actions} = renderEditor(groupProps());

    // Документ предзаполнен: пройти его нужно по секциям — сперва «Далее».
    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));
    });
    expect(actions.filter(action => action.name === 'calc')).toHaveLength(0);

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    const submits = actions.filter(action => action.name === 'calc');
    expect(submits).toHaveLength(1);
    expect(submits[0]!.context.method).toBe('34758');
    expect((submits[0]!.context.lifts as unknown[])).toHaveLength(1);
  });
});

describe('LiftEditorNext: подписи источников', () => {
  it('источник стоит под полем и снимается правкой', async () => {
    renderEditor(perLiftProps());

    expect(screen.getByText('из вашего вопроса')).toBeTruthy();

    await flush(() => {
      fireEvent.change(fieldIn('Здание', 'N'), {target: {value: '18'}});
    });

    expect(screen.queryByText('из вашего вопроса')).toBeNull();
  });
});

/**
 * Тот же проход, что у `KeoEditorNext`, и то же требование: цель шага
 * получает каретку (change next-walkthrough-focus). Панели живут
 * `keepMounted`, поэтому цель ищется по РАСКРЫТОЙ панели.
 */
describe('LiftEditorNext: проход отдаёт каретку цели', () => {
  const nextButton = () => screen.getByRole('button', {name: 'Далее'});

  function openPanel(title: string) {
    return sectionPanel(title).querySelector<HTMLElement>('.a2ui-card__panel:not([hidden])');
  }

  it('шаг прохода ставит каретку на первый контрол раскрытой секции', async () => {
    renderEditor(groupProps());

    await flush(() => {
      nextButton().focus();
      fireEvent.click(nextButton());
    });

    expect(section('Лифт').getAttribute('aria-expanded')).toBe('true');
    // Каретка проверяется конкретным узлом: поле ищется по подписи, которую
    // Base UI `Field` связывает с ВИДИМЫМ контролом.
    expect(document.activeElement).toBe(within(openPanel('Лифт')!).getByLabelText(/Q — грузоподъёмность/));
  });

  it('шаг отправки каретку не двигает', async () => {
    renderEditor(groupProps());

    await flush(() => {
      fireEvent.click(nextButton());
    });
    const submit = screen.getByRole('button', {name: 'Рассчитать'});

    await flush(() => {
      submit.focus();
      fireEvent.click(submit);
    });

    expect(document.activeElement).toBe(submit);
  });

  it('раскрытие заголовком не уводит каретку из поля', async () => {
    renderEditor(perLiftProps());

    await flush(() => {
      fieldIn('Здание', 'N').focus();
    });
    // Каретку запоминаем ПОСЛЕ фокуса: у числового поля Base UI держит свой
    // служебный input и переводит фокус с него на видимый.
    const caret = document.activeElement;

    await flush(() => {
      openSection('Лифт 1');
    });

    expect(section('Лифт 1').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(caret);
  });
});

describe('LiftEditorNext: клавиатура и aria', () => {
  it('секция — кнопка с aria-expanded и aria-controls на свою панель', () => {
    const {container} = renderEditor(perLiftProps());

    const trigger = section('Лифт 1');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    const panelId = trigger.getAttribute('aria-controls')!;
    expect(panelId).toBeTruthy();
    // Панель именно этой секции, а не соседней: id уникален в пределах экрана.
    expect(container.querySelector(`#${CSS.escape(panelId)}`)).toBe(
      sectionPanel('Лифт 1').querySelector(`#${CSS.escape(panelId)}`),
    );
  });

  it('два экрана на странице не делят id панелей', () => {
    renderEditor(perLiftProps());
    renderEditor(perLiftProps());

    const ids = screen
      .getAllByRole('button', {name: sectionName('Здание')})
      .map(trigger => trigger.getAttribute('aria-controls'));

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('попап списка уезжает порталом в body, а не остаётся в карточке', async () => {
    const {container} = renderEditor(groupProps());

    const kind = within(sectionPanel('Здание')).getAllByRole('combobox')[0]!;
    await flush(() => {
      kind.focus();
      fireEvent.keyDown(kind, {key: 'ArrowDown'});
    });

    const option = screen.getAllByRole('option')[0]!;
    expect(container.contains(option)).toBe(false);
    expect(document.body.contains(option)).toBe(true);
  });
});

/**
 * То же правило, что у `KeoEditorNext`: кнопка добавления реагирует на вид
 * предела, а не на значение `maxLifts` (change next-add-item-limit).
 */
/** `maxLifts` живёт в конфиге активной методики, а не в корне props. */
function withMaxLifts(props: Record<string, unknown>, maxLifts: number) {
  const configs = (props.methodConfigs as Array<Record<string, unknown>>).map(config =>
    config.method === props.method ? {...config, maxLifts} : config,
  );
  return {...props, methodConfigs: configs};
}

describe('LiftEditorNext: предел лифтов', () => {
  it('предела нет — кнопка доступна', () => {
    renderEditor(perLiftProps());

    const add = screen.getByRole('button', {name: 'Добавить лифт'}) as HTMLButtonElement;
    expect(add.disabled).toBe(false);
  });

  it('предел в один лифт — кнопки нет в разметке', () => {
    const props = withMaxLifts(perLiftProps(), 1);
    renderEditor({...props, lifts: (props.lifts as unknown[]).slice(0, 1)});

    expect(screen.queryByRole('button', {name: 'Добавить лифт'})).toBeNull();
  });

  it('предел достигнут, но удаление возможно — кнопка на месте и отключена', async () => {
    renderEditor({...withMaxLifts(perLiftProps(), 2), draftAction: DRAFT_ACTION});

    const add = screen.getByRole('button', {name: 'Добавить лифт'}) as HTMLButtonElement;
    expect(add.disabled).toBe(true);

    await flush(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт 2'}));
    });

    const back = screen.getByRole('button', {name: 'Добавить лифт'}) as HTMLButtonElement;
    expect(back.disabled).toBe(false);
  });
});
