import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';

function renderSurface(fileName: string) {
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(
    JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'fixtures', 'messages', fileName), 'utf8'),
    ) as A2uiMessage[],
  );
  const surface = processor.model.getSurface('demo-surface');
  const utils = render(<A2uiSurface surface={surface as any} />);
  return {surface: surface as any, ...utils};
}

const selectByName = (container: HTMLElement, name: string) =>
  container.querySelector(`select[name="${name}"]`) as HTMLSelectElement;

describe('FormCard: select без defaultValue', () => {
  it('показывает пустую опцию первой и не предвыбирает вариант', () => {
    const {container} = renderSurface('form-card-select-surface.json');

    const special = selectByName(container, 'special_categories');
    expect(special.value).toBe('');
    expect(special.options[0].value).toBe('');
    expect(special.options[0].textContent).toBe('Не выбрано');

    // placeholder поля задаёт подпись пустой опции.
    const sphere = selectByName(container, 'kii_sphere');
    expect(sphere.options[0].textContent).toBe('Выберите сферу');
  });

  it('с явным defaultValue пустой опции нет — поведение не изменилось', () => {
    const {container} = renderSurface('form-card-select-surface.json');

    const kind = selectByName(container, 'consent_kind');
    expect(kind.value).toBe('работника');
    expect(kind.options[0].value).toBe('работника');
    expect([...kind.options].some(option => option.value === '')).toBe(false);
  });

  it('нетронутый select уходит в submit пустой строкой, как lookup', async () => {
    const {surface, container} = renderSurface('form-card-select-surface.json');
    const actions: Array<{name: string; context: Record<string, unknown>}> = [];
    surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
      actions.push(action);
    });
    const form = container.querySelector('form') as HTMLFormElement;

    // onAction.emit — асинхронный: submit оборачиваем в act, чтобы дождаться эмита.
    await act(async () => {
      fireEvent.submit(form);
    });

    // Главное здесь: НЕ «да». Первая опция больше не уходит за выбор пользователя.
    expect(actions[0]?.context.special_categories).toBe('');
    expect(actions[0]?.context.kii_sphere).toBe('');
    expect(actions[0]?.context.consent_kind).toBe('работника');
  });

  it('выбранное значение уходит в submit', async () => {
    const {surface, container} = renderSurface('form-card-select-surface.json');
    const actions: Array<{name: string; context: Record<string, unknown>}> = [];
    surface.onAction.subscribe((action: {name: string; context: Record<string, unknown>}) => {
      actions.push(action);
    });

    fireEvent.change(selectByName(container, 'special_categories'), {target: {value: 'нет'}});
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    });

    expect(actions[0]?.context.special_categories).toBe('нет');
  });
});
