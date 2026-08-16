import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, LIFT_DRAFT_DEBOUNCE_MS} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function updateMessage(props: Record<string, unknown>): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'demo-surface',
      components: [{id: 'root', component: 'LiftEditor', ...props}],
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

function perLiftProps() {
  return readProps('lift-editor-per-lift.json');
}

function groupProps() {
  return readProps('lift-editor-group.json');
}

/** Прежний режим кнопки: без `pendingLabel` submit блокируется, как раньше. */
function withoutPending(props: Record<string, unknown>) {
  const {pendingLabel: _unused, ...rest} = props;
  return rest;
}

/** Подпись поля несёт звёздочку и подсказку — ищем по `name`, а не по тексту. */
function field(container: HTMLElement, name: string) {
  return container.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
}

function typeInto(element: HTMLInputElement | HTMLSelectElement, value: string) {
  fireEvent.change(element, {target: {value}});
}

/**
 * Свёрнутая секция: вся строка-сводка — одна кнопка. Accessible name склеивает
 * заголовок, сводку, бейдж и «Показать» без пробелов — матчим по краям.
 * `(?!\d)` не даёт «Лифт 1» захватить «Лифт 10».
 */
function bannerName(title: string) {
  return new RegExp(`^${title}(?!\\d).*Показать$`);
}

function banner(title: string) {
  return screen.getByRole('button', {name: bannerName(title)});
}

function queryBanner(title: string) {
  return screen.queryByRole('button', {name: bannerName(title)});
}

/** Шапка раскрытой секции: «шеврон + заголовок» — кнопка с именем-заголовком. */
function expandedToggle(title: string) {
  return screen.queryByRole('button', {name: title});
}

function openSection(title: string) {
  fireEvent.click(banner(title));
}

function collapseSection(title: string) {
  fireEvent.click(screen.getByRole('button', {name: title}));
}

function openSectionsCount(container: HTMLElement) {
  return container.querySelectorAll('.a2ui-le-section--open').length;
}

function footerButton(label: string) {
  return screen.getByRole('button', {name: label});
}

/** dispatchAction асинхронен — клики и правки с action ждём внутри act. */
async function flush(run: () => void) {
  await act(async () => {
    run();
  });
}

describe('LiftEditor: стили пакета', () => {
  it('два редактора — один тег стилей (дедупликация по href)', () => {
    renderEditor(perLiftProps());
    renderEditor(groupProps());

    const styleTags = document.querySelectorAll(
      'style[data-href^="a2ui-lift-editor"], style[href^="a2ui-lift-editor"]',
    );
    expect(styleTags).toHaveLength(1);
  });

  it('база — одна колонка, две колонки только внутри @container', () => {
    const {container} = renderEditor(perLiftProps());

    expect(container.querySelector('.a2ui-le')).toBeTruthy();
    const css = document.querySelector(
      'style[data-href^="a2ui-lift-editor"], style[href^="a2ui-lift-editor"]',
    )!.textContent!;

    expect(css).toContain('container-type: inline-size');
    // Базовое правило сетки — одна колонка; двухколоночное живёт в @container.
    const [base, wide] = css.split('@container a2ui-le (min-width: 560px)');
    expect(base).toContain('grid-template-columns: 1fr;');
    expect(base).not.toContain('grid-template-columns: 1fr 1fr');
    expect(wide).toContain('grid-template-columns: 1fr 1fr');
    // Инлайновая фиксированная колонка не применяется.
    expect(container.querySelector('[style*="max-width"]')).toBeNull();
  });
});

describe('LiftEditor: секции вместо вкладок', () => {
  it('все секции видны одним экраном, вкладок нет', () => {
    renderEditor(perLiftProps());

    // Полный документ открывается на здании, лифты свёрнуты в строки-сводки.
    expect(expandedToggle('Здание')).toBeTruthy();
    expect(banner('Лифт 1')).toBeTruthy();
    expect(banner('Лифт 2')).toBeTruthy();
    expect(screen.getByRole('button', {name: '+ Добавить лифт'})).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('режим группы: одна секция лифтов, без добавления и удаления', () => {
    renderEditor(groupProps());

    expect(banner('Лифтовая группа')).toBeTruthy();
    expect(screen.queryByRole('button', {name: '+ Добавить лифт'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Удалить лифт'})).toBeNull();
  });

  it('раскрытие локально, введённое переживает сворачивание', () => {
    const {container, actions} = renderEditor(perLiftProps());

    openSection('Лифт 1');
    typeInto(field(container, 'H0'), '12');
    collapseSection('Лифт 1');

    expect(queryBanner('Лифт 1')).toBeTruthy();
    expect(actions).toHaveLength(0);

    openSection('Лифт 1');
    expect(field(container, 'H0').value).toBe('12');
    expect(actions).toHaveLength(0);
  });

  it('ручное раскрытие не сворачивает соседей', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Лифт 1');

    expect(expandedToggle('Здание')).toBeTruthy();
    expect(expandedToggle('Лифт 1')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(2);
  });

  it('заголовок раскрытой секции сворачивает её без action', () => {
    const {actions} = renderEditor(perLiftProps());

    collapseSection('Здание');

    expect(queryBanner('Здание')).toBeTruthy();
    expect(actions).toHaveLength(0);
  });

  it('сводка собирается из живых значений и следует за правкой', () => {
    const {container} = renderEditor(perLiftProps());

    // Сводка здания — только не-advanced поля.
    typeInto(field(container, 'A'), '90');
    collapseSection('Здание');

    expect(banner('Здание').textContent).toContain('N 17 · A 90');
    expect(banner('Здание').textContent).not.toContain('kp');
  });

  it('пустое значение не попадает в сводку, подпись — shortLabel ?? name', () => {
    const props = perLiftProps();
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[1] = {...lifts[1], H0: ''};

    renderEditor({...props, lifts});

    // Секция с пустым обязательным раскрыта начальным состоянием — сворачиваем.
    collapseSection('Лифт 2');
    const summary = banner('Лифт 2').textContent!;
    expect(summary).not.toContain('H₀');
    expect(summary).toContain('Vн 1');
    expect(summary).toContain('Q 1000');
  });

  it('начальное состояние: раскрыта первая секция с незаполненными обязательными', () => {
    const props = perLiftProps();
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[1] = {...lifts[1], H0: ''};

    const {container} = renderEditor({...props, lifts});

    expect(expandedToggle('Лифт 2')).toBeTruthy();
    expect(queryBanner('Здание')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);
  });

  it('пустая форма открывается на здании', () => {
    const props = perLiftProps();
    const {container} = renderEditor({
      ...props,
      building: {...(props.building as Record<string, unknown>), N: ''},
    });

    expect(expandedToggle('Здание')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);
  });
});

describe('LiftEditor: состав лифтов', () => {
  it('добавление раскрывает новую секцию и сворачивает остальные', () => {
    const {container, actions} = renderEditor(perLiftProps());

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить лифт'}));

    expect(expandedToggle('Лифт 3')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);
    expect(queryBanner('Здание')).toBeTruthy();
    // Дефолты полей засеяны.
    expect(field(container, 'Q').value).toBe('630');
    expect(field(container, 'H0').value).toBe('');
    expect(actions).toHaveLength(0);
  });

  it('удаление перенумеровывает секции, значения остаются со своими лифтами', () => {
    const {container, actions} = renderEditor(perLiftProps());

    openSection('Лифт 2');
    typeInto(field(container, 'H0'), '77');
    collapseSection('Лифт 2');
    openSection('Лифт 1');
    fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт'}));

    expect(queryBanner('Лифт 2')).toBeNull();
    expect(expandedToggle('Лифт 2')).toBeNull();

    // Остался бывший второй лифт — теперь «Лифт 1».
    openSection('Лифт 1');
    expect(field(container, 'H0').value).toBe('77');
    expect(actions).toHaveLength(0);
  });

  it('последний лифт не удаляется', () => {
    const props = perLiftProps();
    renderEditor({...props, lifts: [(props.lifts as unknown[])[0]]});

    openSection('Лифт 1');
    expect(screen.queryByRole('button', {name: 'Удалить лифт'})).toBeNull();
  });

  it('на пределе maxLifts добавление недоступно', () => {
    const props = perLiftProps();
    const one = (props.lifts as Array<Record<string, unknown>>)[0]!;
    const configs = (props.methodConfigs as Array<Record<string, unknown>>).map(config =>
      config.method === '52941' ? {...config, maxLifts: 2} : config,
    );

    renderEditor({...props, methodConfigs: configs, lifts: [one, {...one}]});

    expect(screen.getByRole('button', {name: '+ Добавить лифт'})).toBeDisabled();
  });
});

describe('LiftEditor: блок параметров по умолчанию', () => {
  it('свёрнутый блок показывает сводку принятых значений', () => {
    renderEditor(perLiftProps());

    const advanced = banner('Параметры по умолчанию');
    expect(advanced.textContent).toContain('hf 3.3');
    expect(advanced.textContent).toContain('γ↑ 0.8');
  });

  it('правка дефолта обновляет сводку после сворачивания', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Параметры по умолчанию');
    typeInto(field(container, 'i'), '6.5');
    collapseSection('Параметры по умолчанию');

    expect(banner('Параметры по умолчанию').textContent).toContain('i 6.5');
  });

  it('пустое обязательное advanced-поле остаётся снаружи', () => {
    const props = perLiftProps();
    const configs = (props.methodConfigs as Array<Record<string, unknown>>).map(config => {
      if (config.method !== '52941') return config;
      const fields = (config.buildingFields as Array<Record<string, unknown>>).map(item =>
        item.name === 'hf' ? {...item, required: true} : item,
      );
      return {...config, buildingFields: fields};
    });

    const {container} = renderEditor({
      ...props,
      methodConfigs: configs,
      building: {...(props.building as Record<string, unknown>), hf: ''},
    });

    // Пустое обязательное — в основной сетке, не внутри блока дефолтов.
    expect(field(container, 'hf')).toBeTruthy();
    openSection('Параметры по умолчанию');
    const advancedBlock = container.querySelector('.a2ui-le-advanced')!;
    expect(advancedBlock.querySelector('[name="hf"]')).toBeNull();
  });

  it('меньше трёх сворачиваемых полей — блока нет', () => {
    const {container} = renderEditor(groupProps());

    // В ветке 34758 advanced только `hf` — поле в общей сетке.
    expect(queryBanner('Параметры по умолчанию')).toBeNull();
    expect(field(container, 'hf')).toBeTruthy();
  });
});

describe('LiftEditor: шапка и переключатель методики', () => {
  it('шапка: заголовок, контекст, текст «gostLabel · buildingKindLabel»', () => {
    renderEditor(perLiftProps());

    expect(screen.getByText('Параметры расчёта')).toBeInTheDocument();
    expect(screen.getByText('Проект «ЖК Северный, к.3»')).toBeInTheDocument();
    expect(screen.getByText('ГОСТ Р 52941-2008 · жилое здание')).toBeInTheDocument();
  });

  it('тип здания 34758 отражается в шапке живьём, без action', () => {
    const {container, actions} = renderEditor(groupProps());

    expect(screen.getByText('ГОСТ 34758-2021 · Офис')).toBeInTheDocument();

    typeInto(field(container, 'buildingType'), 'Гостиница');

    expect(screen.getByText('ГОСТ 34758-2021 · Гостиница')).toBeInTheDocument();
    expect(actions).toHaveLength(0);
  });

  it('methodField не рендерится полем секции «Здание»', () => {
    const {container} = renderEditor(perLiftProps());

    const methodControls = container.querySelectorAll('[name="method"]');
    expect(methodControls).toHaveLength(1);
    expect(methodControls[0]!.className).toContain('a2ui-le-method__select');
  });

  it('смена методики из шапки перестраивает форму локально', () => {
    const {container, actions} = renderEditor(perLiftProps());

    typeInto(field(container, 'method'), '34758');

    // Ветка 34758 — одна лифтовая группа, add/remove скрыты.
    expect(queryBanner('Лифтовая группа') ?? expandedToggle('Лифтовая группа')).toBeTruthy();
    expect(queryBanner('Лифт 1')).toBeNull();
    expect(screen.queryByRole('button', {name: '+ Добавить лифт'})).toBeNull();
    // Поля здания заменились на набор 34758 (здание раскрыто заново).
    expect(field(container, 'buildingType')).toBeTruthy();
    expect(container.querySelector('[name="N"]')).toBeNull();
    expect(actions).toHaveLength(0);
  });

  it('черновики методик независимы и восстанавливаются', () => {
    const {container} = renderEditor(perLiftProps());

    typeInto(field(container, 'A'), '999');
    typeInto(field(container, 'method'), '34758');

    // Одноимённое поле другой ветки — со своим (пустым) значением.
    expect(field(container, 'A').value).toBe('');
    typeInto(field(container, 'A'), '111');

    typeInto(field(container, 'method'), '52941');
    expect(field(container, 'A').value).toBe('999');

    typeInto(field(container, 'method'), '34758');
    expect(field(container, 'A').value).toBe('111');
  });

  it('без headerTitle шапки нет, переключатель — над секциями', () => {
    const props = perLiftProps();
    const {headerTitle: _t, headerContext: _c, ...rest} = props;

    const {container} = renderEditor(rest);

    expect(container.querySelector('.a2ui-le__header')).toBeNull();
    expect(screen.getByText('ГОСТ Р 52941-2008 · жилое здание')).toBeInTheDocument();
    expect(field(container, 'method')).toBeTruthy();
  });
});

describe('LiftEditor: двухрежимная кнопка «Далее»/«Рассчитать»', () => {
  it('предзаполненный документ проходится по секциям до submit', async () => {
    const {container, actions} = renderEditor(perLiftProps());

    // Свёрнутые непросмотренные помечены «просмотреть», кнопка — «Далее».
    expect(banner('Лифт 1').textContent).toContain('просмотреть');
    expect(banner('Лифт 2').textContent).toContain('просмотреть');
    expect(screen.queryByRole('button', {name: 'Рассчитать'})).toBeNull();

    // «Далее»: здание сворачивается, раскрыт только «Лифт 1».
    fireEvent.click(footerButton('Далее'));
    expect(expandedToggle('Лифт 1')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);
    expect(actions).toHaveLength(0);

    fireEvent.click(footerButton('Далее'));
    expect(expandedToggle('Лифт 2')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);

    // Все секции просмотрены и заполнены — кнопка становится «Рассчитать».
    const submit = footerButton('Рассчитать');
    await flush(() => fireEvent.click(submit));

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('calc');
    // Payload не изменился: только документ активной ветки, без источников.
    expect(Object.keys(actions[0]!.context).sort()).toEqual(['building', 'lifts', 'method']);
    expect((actions[0]!.context.building as Record<string, unknown>).N).toBe(17);
  });

  it('«Далее» ведёт к первой секции с незаполненными обязательными', () => {
    const props = perLiftProps();
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[0] = {...lifts[0], H0: ''};
    lifts[1] = {...lifts[1], H0: ''};

    const {container} = renderEditor({...props, lifts});

    // Первая незаполненная раскрыта; вторая помечена «заполните».
    expect(expandedToggle('Лифт 1')).toBeTruthy();
    expect(banner('Лифт 2').textContent).toContain('заполните');

    // Пока «Лифт 1» не заполнен, «Далее» держит на нём ровно одну раскрытую.
    openSection('Здание');
    fireEvent.click(footerButton('Далее'));
    expect(expandedToggle('Лифт 1')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);

    typeInto(field(container, 'H0'), '0');
    fireEvent.click(footerButton('Далее'));
    expect(expandedToggle('Лифт 2')).toBeTruthy();
    expect(openSectionsCount(container)).toBe(1);
  });

  it('раскрытие снимает «просмотреть»; заполнение снимает «заполните»', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Лифт 1');
    collapseSection('Лифт 1');
    expect(banner('Лифт 1').textContent).not.toContain('просмотреть');

    openSection('Лифт 2');
    collapseSection('Лифт 2');
    // Непросмотренных и незаполненных не осталось — кнопка «Рассчитать».
    expect(footerButton('Рассчитать')).toBeTruthy();

    // Пустое обязательное помечает секцию «заполните» даже в свёрнутом виде.
    openSection('Лифт 1');
    typeInto(field(container, 'H0'), '');
    collapseSection('Лифт 1');
    expect(banner('Лифт 1').textContent).toContain('заполните');
    expect(footerButton('Далее')).toBeTruthy();
  });

  it('значение вне нормативного ряда submit не блокирует', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Лифт 1');
    typeInto(field(container, 'Vn'), '7,5');
    openSection('Лифт 2');

    expect(footerButton('Рассчитать')).not.toBeDisabled();
  });

  it('без pendingLabel кнопка блокируется, как раньше', async () => {
    const props = perLiftProps();
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[0] = {...lifts[0], H0: ''};

    const {container, actions} = renderEditor(withoutPending({...props, lifts}));

    expect(footerButton('Рассчитать')).toBeDisabled();

    typeInto(field(container, 'H0'), '0');
    expect(footerButton('Рассчитать')).not.toBeDisabled();

    await flush(() => fireEvent.click(footerButton('Рассчитать')));
    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('calc');
  });

  it('смена методики сбрасывает счёт просмотренного', () => {
    const {container} = renderEditor(perLiftProps());

    // Проходим ветку 52941 целиком.
    fireEvent.click(footerButton('Далее'));
    fireEvent.click(footerButton('Далее'));
    expect(footerButton('Рассчитать')).toBeTruthy();

    typeInto(field(container, 'method'), '34758');
    // Новая ветка не просмотрена — кнопка снова «Далее».
    expect(footerButton('Далее')).toBeTruthy();
  });
});

describe('LiftEditor: provenance полей', () => {
  it('подпись — note либо словоформа источника', () => {
    const {container} = renderEditor(perLiftProps());

    expect(screen.getByText('из вашего вопроса')).toBeInTheDocument();
    expect(screen.getByText('из вопроса')).toBeInTheDocument();

    openSection('Лифт 1');
    expect(screen.getByText('предложено по классу здания')).toBeInTheDocument();
    expect(screen.getByText('предложено агентом')).toBeInTheDocument();
    // Оформление контрола от источника не меняется — только подпись.
    expect(field(container, 'Q').className).toBe('a2ui-le-control');
  });

  it('правка поля снимает подпись независимо от вернувшегося значения', () => {
    const {container} = renderEditor(perLiftProps());

    typeInto(field(container, 'A'), '999');
    typeInto(field(container, 'A'), '340');

    expect(screen.queryByText('из вопроса')).toBeNull();
    // Соседняя подпись осталась.
    expect(screen.getByText('из вашего вопроса')).toBeInTheDocument();
  });

  it('новый снапшот props возвращает подписи по присланным блокам', async () => {
    const {container, processor} = renderEditor(perLiftProps());

    typeInto(field(container, 'A'), '999');
    expect(screen.queryByText('из вопроса')).toBeNull();

    const next = perLiftProps();
    await updateProps(processor, {
      ...next,
      building: {...(next.building as Record<string, unknown>), A: 360},
    });

    expect(screen.getByText('из вопроса')).toBeInTheDocument();
    expect(field(container, 'A').value).toBe('360');
  });

  it('удаление лифта сдвигает источники вместе с секциями', () => {
    const props = perLiftProps();
    // Источник только у первого лифта; после его удаления бывший второй лифт
    // не должен унаследовать чужую подпись.
    const {container} = renderEditor(props);

    openSection('Лифт 1');
    fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт'}));
    openSection('Лифт 1');

    expect(field(container, 'Q').value).toBe('1000');
    expect(screen.queryByText('предложено по классу здания')).toBeNull();
  });

  it('без sources-пропов подписи не рисуются, hint остаётся', () => {
    const props = perLiftProps();
    const {buildingSources: _b, liftSources: _l, ...rest} = props;

    renderEditor(rest);

    expect(screen.queryByText('из вопроса')).toBeNull();
    openSection('Лифт 1');
    expect(screen.getByText(/типовые значения — подсказка/)).toBeInTheDocument();
  });
});

describe('LiftEditor: live-автосейв черновика (draftAction)', () => {
  const DRAFT = 'lift:draft';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function draftEditor(overrides: Record<string, unknown> = {}) {
    return renderEditor({...perLiftProps(), draftAction: DRAFT, ...overrides});
  }

  /** Пауза ввода: окно дебаунса истекло, отложенный черновик ушёл. */
  async function flushDraftDebounce() {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(LIFT_DRAFT_DEBOUNCE_MS);
    });
  }

  function draftLifts(action: {context: Record<string, unknown>}) {
    return action.context.lifts as Array<Record<string, unknown>>;
  }

  it('серия правок схлопывается в один черновик с последним состоянием', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '350');
    typeInto(field(container, 'A'), '360');
    typeInto(field(container, 'N'), '18');
    expect(actions).toHaveLength(0);

    await flushDraftDebounce();

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe(DRAFT);
    expect(actions[0]!.context.building).toMatchObject({A: '360', N: '18'});
  });

  it('проход по полям и blur без правок ничего не шлют', async () => {
    const {container, actions} = draftEditor();

    fireEvent.focus(field(container, 'A'));
    fireEvent.blur(field(container, 'A'));
    await flushDraftDebounce();

    expect(actions).toHaveLength(0);
  });

  it('правка сохраняется без ухода с поля', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '360');
    await flushDraftDebounce();

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context.building as Record<string, unknown>).A).toBe('360');
  });

  it('добавление и удаление лифта шлют черновик немедленно, отменяя отложенный', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '360');
    await flush(() => fireEvent.click(screen.getByRole('button', {name: '+ Добавить лифт'})));

    // Немедленный черновик несёт и правку, и новый состав лифтов.
    expect(actions).toHaveLength(1);
    expect(draftLifts(actions[0]!)).toHaveLength(3);
    expect((actions[0]!.context.building as Record<string, unknown>).A).toBe('360');

    await flushDraftDebounce();
    expect(actions).toHaveLength(1);

    await flush(() =>
      fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт'})),
    );
    expect(actions).toHaveLength(2);
    expect(draftLifts(actions[1]!)).toHaveLength(2);
  });

  it('смена методики шлёт черновик вновь выбранной ветки немедленно', async () => {
    const {container, actions} = draftEditor();

    await flush(() => typeInto(field(container, 'method'), '34758'));

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe(DRAFT);
    expect(actions[0]!.context.method).toBe('34758');
    const building = actions[0]!.context.building as Record<string, unknown>;
    expect(building).toHaveProperty('buildingType');
    expect(building).not.toHaveProperty('N');
    expect(draftLifts(actions[0]!)).toHaveLength(1);
  });

  it('«Далее» фиксирует правки немедленно, не дожидаясь дебаунса', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '360');
    await flush(() => fireEvent.click(footerButton('Далее')));

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context.building as Record<string, unknown>).A).toBe('360');

    await flushDraftDebounce();
    expect(actions).toHaveLength(1);
  });

  it('дедуп по содержимому: повторный триггер того же состояния молчит', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '360');
    await flushDraftDebounce();
    expect(actions).toHaveLength(1);

    // «Далее» — немедленный триггер, но payload не изменился.
    await flush(() => fireEvent.click(footerButton('Далее')));
    expect(actions).toHaveLength(1);
  });

  it('submit гасит отложенный черновик', async () => {
    const {container, actions} = draftEditor();

    // Проходим секции до режима submit (каждый «Далее» шлёт черновик один раз
    // — дедуп по содержимому).
    await flush(() => fireEvent.click(footerButton('Далее')));
    await flush(() => fireEvent.click(footerButton('Далее')));
    const walkDrafts = actions.length;

    typeInto(field(container, 'Q'), '450');
    await flush(() => fireEvent.click(footerButton('Рассчитать')));
    await flushDraftDebounce();

    const tail = actions.slice(walkDrafts);
    expect(tail).toHaveLength(1);
    expect(tail[0]!.name).toBe('calc');
    expect(draftLifts(tail[0]!)[1]!.Q).toBe('450');
  });

  it('черновик и submit несут одинаковый payload без источников', async () => {
    const {container, actions} = draftEditor();

    typeInto(field(container, 'A'), '360');
    await flushDraftDebounce();

    expect(Object.keys(actions[0]!.context).sort()).toEqual(['building', 'lifts', 'method']);
  });

  it('без draftAction наружу уходит только submit', async () => {
    const {container, actions} = renderEditor(perLiftProps());

    typeInto(field(container, 'A'), '360');
    await flushDraftDebounce();
    await flush(() => fireEvent.click(footerButton('Далее')));
    await flush(() => fireEvent.click(footerButton('Далее')));

    expect(actions).toHaveLength(0);

    await flush(() => fireEvent.click(footerButton('Рассчитать')));
    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('calc');
  });
});

describe('LiftEditor: свободный ввод и зависимые значения', () => {
  it('значение вне ряда принимается и уходит в submit', async () => {
    const {container, actions} = renderEditor(withoutPending(perLiftProps()));

    openSection('Лифт 1');
    typeInto(field(container, 'Q'), '450');
    await flush(() => fireEvent.click(footerButton('Рассчитать')));

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context.lifts as Array<Record<string, unknown>>)[0]!.Q).toBe('450');
  });

  it('выбор подсказки combo триггерит зависимое правило', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Лифт 1');
    typeInto(field(container, 'Vn'), '2.5');

    expect(field(container, 'h').value).toBe('6');
    expect(field(container, 't123').value).toBe('14');
  });

  it('optionsBy: смена управляющего поля здания меняет подсказки лифта', () => {
    const {container} = renderEditor(groupProps());

    openSection('Лифтовая группа');
    const optionsFor = () => {
      const listId = field(container, 'doorWidth').getAttribute('list')!;
      return [...container.querySelectorAll(`#${listId} option`)].map(option =>
        option.getAttribute('value'),
      );
    };

    expect(optionsFor()).toEqual(['1100', '1200']);

    typeInto(field(container, 'buildingType'), 'Жилое');

    expect(optionsFor()).toEqual(['800', '900', '1100']);
    expect(field(container, 'doorWidth').value).toBe('1100');
  });

  it('источник со scope building пересчитывает поле лифта', () => {
    const {container} = renderEditor(groupProps());

    openSection('Лифтовая группа');
    typeInto(field(container, 'buildingType'), 'Жилое');

    // Жилое × 1100 × 1.6 → 12.2 (Прил. Е).
    expect(field(container, 'tOst').value).toBe('12.2');
  });

  it('ручная правка живёт до смены источника, потом возвращается авто', () => {
    const {container} = renderEditor(perLiftProps());

    openSection('Лифт 1');
    typeInto(field(container, 'h'), '99');
    typeInto(field(container, 'H0'), '5');
    expect(field(container, 'h').value).toBe('99');

    typeInto(field(container, 'Vn'), '4');
    expect(field(container, 'h').value).toBe('15');
  });
});
