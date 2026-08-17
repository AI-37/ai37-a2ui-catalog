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
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', 'keo-editor.json'), 'utf8'),
  ).props as Record<string, unknown>;
}

/** Подпись поля несёт звёздочку и подпись источника — ищем по `name`, а не по тексту. */
function field(container: HTMLElement, name: string) {
  return container.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
}

function renderEditor(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'KeoEditor', ...props}],
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

describe('KeoEditor', () => {
  it('renders read-only conditions and the room tab', () => {
    const {container} = renderEditor(readProps());

    expect(screen.getByText('Тюмень · группа светового климата 1 (СП 52, прил. Е)')).toBeTruthy();
    expect(screen.getByText('0,5 % — жилые комнаты и кухни')).toBeTruthy();
    expect(screen.getByRole('tab', {name: 'Жилая комната'})).toBeTruthy();
    // Редактируемого поля «рабочая плоскость» в компоненте нет намеренно.
    expect(container.textContent).not.toContain('Рабочая плоскость');
  });

  it('computes the plane and reference-point caption and recomputes it locally', () => {
    const {actions, container} = renderEditor(readProps());

    expect(
      screen.getByText(
        'плоскость расчёта — пол Г-0,0 (СП 52, прил. Л, пп. 187–188) · расчётная точка — на полу, 1 м от дальней стены',
      ),
    ).toBeTruthy();

    fireEvent.change(field(container, 'purpose'), {target: {value: 'Кухня'}});

    expect(
      screen.getByText(
        'плоскость расчёта — пол Г-0,0 (СП 52, прил. Л, п. 188) · расчётная точка — на полу, в центре помещения',
      ),
    ).toBeTruthy();
    expect(actions).toHaveLength(0);
  });

  it('captions provenance and turns an edited field into «изменено вами»', () => {
    const {container} = renderEditor(readProps());

    expect(screen.getByText('ρ_ф 0,5 — допущение при неизвестной отделке фасада')).toBeTruthy();
    expect(container.textContent).toContain('5 из проекта');

    fireEvent.change(field(container, 'sillHeight'), {target: {value: '1.0'}});

    expect(screen.getByText('изменено вами')).toBeTruthy();
    expect(container.textContent).toContain('1 изменено вами');
  });

  it('reveals the shading branch by its trigger field and warns about the open horizon', () => {
    const {container} = renderEditor(readProps());

    expect(field(container, 'distance')).toBeTruthy();

    fireEvent.change(field(container, 'opposing'), {
      target: {value: 'Нет — открытый горизонт'},
    });

    expect(container.querySelector('[name="distance"]')).toBeNull();
    expect(
      screen.getByText(
        'опасное допущение: не указанная застройка завышает результат — сверьте с генпланом',
      ),
    ).toBeTruthy();
  });

  it('warns on violated geometry rules without blocking submit', () => {
    const {container} = renderEditor(readProps());

    expect(screen.queryByText(/! проверить/)).toBeNull();

    // d_п 8,0 при h₀₁ = 0,9 + 1,5 = 2,4 → 3,33 > 2,5.
    fireEvent.change(field(container, 'depth'), {target: {value: '8'}});

    expect(
      screen.getAllByText('! проверить — d_п/h₀₁ ≤ 2,5 для жилых помещений (СП 367 п. 9.1.1)'),
    ).toHaveLength(2);
    expect(screen.getByRole('button', {name: 'Рассчитать'}).hasAttribute('disabled')).toBe(false);
  });

  it('adds a room locally and submits the whole document once', async () => {
    const {actions, container} = renderEditor(readProps());

    fireEvent.click(screen.getByRole('button', {name: '+ Добавить помещение'}));
    fireEvent.change(field(container, 'purpose'), {target: {value: 'Кухня'}});

    expect(actions).toHaveLength(0);
    expect(screen.getByRole('tab', {name: 'Помещение 2'})).toBeTruthy();

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Рассчитать'}));
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]!.name).toBe('keo_calculate');

    const context = actions[0]!.context as {
      conditions: Record<string, string>;
      rooms: Array<{name: string; values: Record<string, unknown>}>;
    };
    expect(context.conditions.region).toContain('Тюмень');
    expect(context.rooms).toHaveLength(2);
    expect(context.rooms[0]!.values.purpose).toBe('Жилая комната');
    expect(context.rooms[1]!.values.purpose).toBe('Кухня');
  });

  it('collapses the defaults section into a summary of accepted values', () => {
    const {container} = renderEditor(readProps());

    const banner = screen.getByRole('button', {name: /Коэффициенты приняты по умолчанию/});
    expect(banner.textContent).toContain('MF 0.83');
    // Свёрнутая секция не рендерит контролы.
    expect(container.querySelector('[name="mf"]')).toBeNull();

    fireEvent.click(banner);

    expect(field(container, 'mf')).toBeTruthy();
  });
});
