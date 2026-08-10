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

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function renderEditor(props: Record<string, unknown>) {
  const messages: A2uiMessage[] = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'LiftEditor', ...props}],
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

function perLiftProps() {
  return readProps('lift-editor-per-lift.json');
}

function groupProps() {
  return readProps('lift-editor-group.json');
}

/** Подпись поля несёт звёздочку и подсказку — ищем по `name`, а не по тексту. */
function field(container: HTMLElement, name: string) {
  return container.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
}

function tab(name: string | RegExp) {
  return screen.getByRole('tab', {name});
}

function openTab(name: string | RegExp) {
  fireEvent.click(tab(name));
}

function submitButton() {
  return screen.getByRole('button', {name: 'Рассчитать'});
}

/** dispatchAction асинхронен — клик по submit ждём внутри act. */
async function clickSubmit() {
  await act(async () => {
    fireEvent.click(submitButton());
  });
}

function typeInto(element: HTMLInputElement | HTMLSelectElement, value: string) {
  fireEvent.change(element, {target: {value}});
}

describe('LiftEditor: вкладки', () => {
  it('переключение вкладок ничего не отправляет и сохраняет введённое', () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'H0'), '12');
    openTab('Здание');

    expect(field(container, 'N')).toBeTruthy();
    expect(actions).toHaveLength(0);

    openTab('Лифт 1');
    expect(field(container, 'H0').value).toBe('12');
    expect(actions).toHaveLength(0);
  });

  it('при монтировании активна первая вкладка с незаполненными обязательными', () => {
    const props = perLiftProps();
    // Здание заполнено, у второго лифта нет H0 → активен «Лифт 2».
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[1] = {...lifts[1], H0: ''};

    renderEditor({...props, lifts});

    expect(tab('Лифт 2')).toHaveAttribute('aria-selected', 'true');
  });

  it('всё заполнено — активна последняя вкладка лифта', () => {
    renderEditor(perLiftProps());

    expect(tab('Лифт 2')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('LiftEditor: состав лифтов', () => {
  it('добавление лифта локально, с дефолтами и переходом на новую вкладку', () => {
    const {container, actions} = renderEditor(perLiftProps());

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить лифт'}));

    expect(tab('Лифт 3')).toHaveAttribute('aria-selected', 'true');
    expect(field(container, 'Q').value).toBe('630');
    expect(field(container, 'H0').value).toBe('');
    expect(actions).toHaveLength(0);
  });

  it('удаление лифта перенумеровывает вкладки и ничего не отправляет', () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Лифт 2');
    typeInto(field(container, 'H0'), '77');
    openTab('Лифт 1');
    fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт'}));

    expect(screen.queryByRole('tab', {name: 'Лифт 2'})).toBeNull();
    expect(tab('Лифт 1')).toHaveAttribute('aria-selected', 'true');
    // Остался бывший второй лифт.
    expect(field(container, 'H0').value).toBe('77');
    expect(actions).toHaveLength(0);
  });

  it('последний лифт не удаляется', () => {
    const props = perLiftProps();
    renderEditor({...props, lifts: [(props.lifts as unknown[])[0]]});

    openTab('Лифт 1');
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

describe('LiftEditor: методика', () => {
  it('смена методики перестраивает поля и вкладки без dispatchAction', () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Здание');
    typeInto(field(container, 'method'), '34758');

    // Ветка 34758 — одна лифтовая группа, add/remove скрыты.
    expect(screen.getByRole('tab', {name: 'Лифтовая группа'})).toBeTruthy();
    expect(screen.queryByRole('tab', {name: 'Лифт 1'})).toBeNull();
    expect(screen.queryByRole('button', {name: '+ Добавить лифт'})).toBeNull();
    // Поля здания заменились на набор 34758.
    expect(field(container, 'buildingType')).toBeTruthy();
    expect(container.querySelector('[name="N"]')).toBeNull();
    expect(actions).toHaveLength(0);
  });

  it('режим группы: две вкладки, без добавления и удаления', () => {
    renderEditor(groupProps());

    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('button', {name: '+ Добавить лифт'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Удалить лифт'})).toBeNull();
  });

  it('тип здания не меняет состав формы', () => {
    const {container} = renderEditor(groupProps());

    openTab('Здание');
    const before = screen.getAllByRole('tab').length;
    typeInto(field(container, 'buildingType'), 'Жилое');

    expect(screen.getAllByRole('tab')).toHaveLength(before);
    expect(field(container, 'N1')).toBeTruthy();
  });

  it('черновики методик независимы и восстанавливаются', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Здание');
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
});

describe('LiftEditor: поля со свободным вводом', () => {
  it('значение вне ряда принимается и уходит в submit', async () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'Q'), '450');
    await clickSubmit();

    expect(actions).toHaveLength(1);
    expect((actions[0]!.context.lifts as Array<Record<string, unknown>>)[0]!.Q).toBe('450');
  });

  it('выбор подсказки combo триггерит зависимое правило', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'Vn'), '2.5');

    expect(field(container, 'h').value).toBe('6');
    expect(field(container, 't123').value).toBe('14');
  });

  it('optionsBy: смена управляющего поля меняет подсказки, значение остаётся', () => {
    const {container} = renderEditor(groupProps());

    openTab('Лифтовая группа');
    // id datalist'а живёт вместе с монтированием поля — перечитываем каждый раз.
    const optionsFor = () => {
      const listId = field(container, 'doorWidth').getAttribute('list')!;
      return [...container.querySelectorAll(`#${listId} option`)].map(option =>
        option.getAttribute('value'),
      );
    };

    expect(optionsFor()).toEqual(['1100', '1200']);

    openTab('Здание');
    typeInto(field(container, 'buildingType'), 'Жилое');
    openTab('Лифтовая группа');

    expect(optionsFor()).toEqual(['800', '900', '1100']);
    // Введённое значение вне нового ряда не сбрасывается (здесь — осталось в ряду).
    expect(field(container, 'doorWidth').value).toBe('1100');
  });
});

describe('LiftEditor: зависимые значения', () => {
  it('один источник: строка ряда перезаписывает зависимые поля', () => {
    const {container} = renderEditor(groupProps());

    openTab('Лифтовая группа');
    typeInto(field(container, 'Q'), '2500');

    expect(field(container, 'Pk').value).toBe('26');
  });

  it('источник со scope building пересчитывает поле лифта', () => {
    const {container} = renderEditor(groupProps());

    openTab('Здание');
    typeInto(field(container, 'buildingType'), 'Жилое');
    openTab('Лифтовая группа');

    // Жилое × 1100 × 1.6 → 12.2 (Прил. Е).
    expect(field(container, 'tOst').value).toBe('12.2');
  });

  it('onNoMatch clear: комбинация вне таблицы очищает зависимое поле', () => {
    const {container} = renderEditor(groupProps());

    openTab('Лифтовая группа');
    typeInto(field(container, 'Q'), '777');

    expect(field(container, 'Pk').value).toBe('');
  });

  it('keep: значение вне ряда не трогает зависимые поля', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'Vn'), '2.5');
    expect(field(container, 'h').value).toBe('6');

    typeInto(field(container, 'Vn'), '0.63');
    expect(field(container, 'h').value).toBe('6');
  });

  it('ручная правка живёт до смены источника, потом возвращается авто', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'h'), '99');
    // Правка не источника — h не перетирается.
    typeInto(field(container, 'H0'), '5');
    expect(field(container, 'h').value).toBe('99');

    typeInto(field(container, 'Vn'), '4');
    expect(field(container, 'h').value).toBe('15');
  });
});

describe('LiftEditor: экспандер параметров по умолчанию', () => {
  it('три и более заполненных advanced-поля сворачиваются', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Здание');
    const details = container.querySelector('details')!;

    expect(details).toBeTruthy();
    expect(details.querySelector('[name="kp"]')).toBeTruthy();
    expect(details.querySelector('[name="N"]')).toBeNull();
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

    openTab('Здание');
    const details = container.querySelector('details')!;

    expect(details.querySelector('[name="hf"]')).toBeNull();
    expect(field(container, 'hf')).toBeTruthy();
  });

  it('меньше трёх сворачиваемых полей — блока нет', () => {
    const {container} = renderEditor(groupProps());

    openTab('Здание');

    // В ветке 34758 advanced только `hf`.
    expect(container.querySelector('details')).toBeNull();
    expect(field(container, 'hf')).toBeTruthy();
  });
});

describe('LiftEditor: валидация и submit', () => {
  it('незаполненное обязательное помечает вкладку и блокирует submit', () => {
    const props = perLiftProps();
    const lifts = (props.lifts as Array<Record<string, unknown>>).map(lift => ({...lift}));
    lifts[0] = {...lifts[0], H0: ''};

    const {container, actions} = renderEditor({...props, lifts});

    expect(tab('Лифт 1')).toHaveAttribute('data-incomplete', 'true');
    expect(submitButton()).toBeDisabled();

    openTab('Лифт 1');
    typeInto(field(container, 'H0'), '0');

    expect(tab('Лифт 1')).not.toHaveAttribute('data-incomplete');
    expect(submitButton()).not.toBeDisabled();
    expect(actions).toHaveLength(0);
  });

  it('значение вне нормативного ряда submit не блокирует', () => {
    const {container} = renderEditor(perLiftProps());

    openTab('Лифт 1');
    typeInto(field(container, 'Vn'), '7,5');

    expect(submitButton()).not.toBeDisabled();
  });

  it('за сессию редактирования наружу уходит ровно один action', async () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Здание');
    typeInto(field(container, 'A'), '360');
    typeInto(field(container, 'method'), '34758');
    typeInto(field(container, 'method'), '52941');
    openTab('Лифт 1');
    typeInto(field(container, 'Vn'), '2.5');
    fireEvent.click(screen.getByRole('button', {name: '+ Добавить лифт'}));
    fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт'}));
    await clickSubmit();

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('calc');
  });

  it('submit несёт документ только активной ветки', async () => {
    const {container, actions} = renderEditor(perLiftProps());

    openTab('Здание');
    typeInto(field(container, 'method'), '34758');
    typeInto(field(container, 'method'), '52941');
    await clickSubmit();

    const {method, building, lifts} = actions[0]!.context as {
      method: string;
      building: Record<string, unknown>;
      lifts: Array<Record<string, unknown>>;
    };

    expect(method).toBe('52941');
    expect(lifts).toHaveLength(2);
    expect(building.N).toBe(17);
    expect(building).not.toHaveProperty('buildingType');
  });
});
