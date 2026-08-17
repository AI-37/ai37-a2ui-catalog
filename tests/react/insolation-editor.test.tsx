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

function readProps() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'fixtures', 'valid', 'insolation-editor.json'),
      'utf8',
    ),
  ).props as Record<string, unknown>;
}

/** Подпись поля несёт звёздочку и подпись источника — ищем по `name`. */
function fields(container: HTMLElement, name: string) {
  return [...container.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)];
}

function field(container: HTMLElement, name: string) {
  return fields(container, name)[0]!;
}

function renderEditor(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'InsolationEditor', ...props}],
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

describe('InsolationEditor', () => {
  it('renders conditions, the point tab and the shading building row', () => {
    const {container} = renderEditor(readProps());

    expect(screen.getByText('Тюмень · центральная широтная зона')).toBeTruthy();
    expect(screen.getByText('не менее 2 ч 30 мин непрерывно')).toBeTruthy();
    expect(screen.getByRole('tab', {name: 'Точка 1 · комната 3 этажа'})).toBeTruthy();
    // Здание — строка из четырёх полей внутри секции застройки.
    expect(container.querySelectorAll('.a2ui-ie-building')).toHaveLength(1);
    expect((field(container, 'distance') as HTMLInputElement).value).toBe('38');
  });

  it('captions agent-computed values and does not recompute them on edit', () => {
    const {actions, container} = renderEditor(readProps());

    expect(
      screen.getByText(
        'рассчитано по этажу 3 и высоте этажа 2,8 м — проверьте отметку ±0,000',
      ),
    ).toBeTruthy();

    fireEvent.change(field(container, 'windowElevation'), {target: {value: '9.0'}});

    expect(screen.getByText('изменено вами')).toBeTruthy();
    // Дата проверки не пересчитывается: пересчёт по этажу — знание агента.
    expect((field(container, 'checkDate') as HTMLInputElement).value).toBe('22 апреля');
    expect(actions).toHaveLength(0);
  });

  it('renders the model notices as non-blocking warnings', () => {
    const {container} = renderEditor(readProps());

    expect(container.querySelectorAll('.a2ui-ie-notice')).toHaveLength(3);
    expect(
      screen.getByText(
        'Учтено 1 здание из вашего вопроса — сверьте с генпланом: не указанная застройка завышает результат.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Рассчитать'}).hasAttribute('disabled')).toBe(false);
  });

  it('adds a point and a building locally, then submits the whole document', async () => {
    const {actions, container} = renderEditor(readProps());

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить расчётную точку'}));
    fireEvent.change(field(container, 'floor'), {target: {value: '7'}});
    fireEvent.click(screen.getByRole('button', {name: '+ Добавить здание'}));

    const distances = fields(container, 'distance');
    fireEvent.change(distances[distances.length - 1]!, {target: {value: '54'}});

    expect(actions).toHaveLength(0);
    expect(container.querySelectorAll('.a2ui-ie-building')).toHaveLength(2);

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('insolation_calculate');

    const context = actions[0]!.context as {
      conditions: Record<string, string>;
      points: Array<{name: string; values: Record<string, unknown>}>;
      buildings: Array<Record<string, unknown>>;
    };
    expect(context.conditions.norm).toBe('не менее 2 ч 30 мин непрерывно');
    expect(context.points).toHaveLength(2);
    expect(context.points[1]!.values.floor).toBe('7');
    expect(context.buildings).toHaveLength(2);
    expect(context.buildings[1]!.distance).toBe('54');
  });

  it('removes a building row locally', () => {
    const {actions, container} = renderEditor(readProps());

    fireEvent.click(screen.getByRole('button', {name: 'Удалить'}));

    expect(container.querySelectorAll('.a2ui-ie-building')).toHaveLength(0);
    expect(screen.getByText('Застройка не указана')).toBeTruthy();
    expect(actions).toHaveLength(0);
  });
});
