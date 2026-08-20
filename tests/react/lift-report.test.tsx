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

function renderReport(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'LiftReport', ...props}],
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

describe('LiftReport', () => {
  it('renders verdict, «Что изменить» and inputs', () => {
    const {container} = renderReport(readProps('lift-report.json'));

    const badge = container.querySelector('.a2ui-lr__badge--fail')!;
    expect(badge.textContent).toContain('НЕ СООТВЕТСТВУЕТ ГОСТ');
    expect(screen.getByText('Интервал движения — 220 с')).toBeTruthy();
    expect(screen.getByText(/Норма для жилых зданий — не более 100 с/)).toBeTruthy();

    expect(screen.getByText('Что изменить')).toBeTruthy();
    // Рекомендуемый вариант — акцентная рамка (tone: 'pass').
    const recommended = container.querySelector('.a2ui-lr__row--pass')!;
    expect(recommended.textContent).toContain('3 лифта в группе');
    expect(recommended.textContent).toContain('Интервал 73 с — проходит с запасом');
    // Непроходящий вариант — статус-лейбл danger-цветом, кнопки нет.
    const failing = container.querySelector('.a2ui-lr__row--fail')!;
    expect(failing.querySelector('.a2ui-lr__status--fail')!.textContent).toBe('не проходит');
    expect(failing.querySelector('button')).toBeNull();
    expect(screen.getAllByRole('button', {name: 'Пересчитать'})).toHaveLength(2);

    expect(screen.getByText('Исходные данные')).toBeTruthy();
  });

  it('dispatches report_apply_suggestion with suggestionId and report_edit_inputs', async () => {
    const {actions} = renderReport(readProps('lift-report.json'));

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Пересчитать'})[0]);
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
    });

    expect(actions).toHaveLength(2);
    expect(actions[0]!.name).toBe('report_apply_suggestion');
    expect(actions[0]!.context).toMatchObject({suggestionId: 'n3'});
    expect(actions[1]!.name).toBe('report_edit_inputs');
    expect(actions[1]!.context).toEqual({});
  });

  it('marks system-assumed inputs group with warning tone', () => {
    const {container} = renderReport(readProps('lift-report.json'));

    const warningGroup = container.querySelector('.a2ui-lr__group--warning')!;
    expect(warningGroup.textContent).toContain('Принято системой — проверьте');
    expect(warningGroup.textContent).toContain('Интенсивность движения');
    expect(warningGroup.querySelector('.a2ui-lr__note')!.textContent).toContain(
      'ГОСТ Р 52941-2008',
    );
  });

  it('collapses the protocol and shows the format dropdown for downloadUrl', () => {
    const {container} = renderReport(readProps('lift-report.json'));

    const protocol = container.querySelector('.a2ui-lr__protocol') as HTMLDetailsElement;
    expect(protocol.tagName).toBe('DETAILS');
    expect(protocol.open).toBe(false);
    expect(protocol.querySelector('.a2ui-lr__protocol-body')!.textContent).toContain(
      'Интервал = T/n',
    );

    // «Скачать ▾» — dropdown форматов: .md — прямая ссылка (download-заголовки ставит
    // сервер агента), .docx — конверт-сервис chat-backend.
    const items = container.querySelectorAll<HTMLAnchorElement>('.a2ui-dfm__item');
    expect(items).toHaveLength(2);
    expect(items[0]!.getAttribute('href')).toBe(
      '/api/agent-resource?resource=lift-report&taskId=t1',
    );
    expect(items[1]!.getAttribute('href')).toBe(
      '/api/agent-resource/convert?format=docx&resource=lift-report&taskId=t1',
    );
    // Клик по пункту меню протокол не раскрывает (activation behavior — у <a>).
    fireEvent.click(items[0]!);
    expect(protocol.open).toBe(false);
  });

  it('omits the download menu when downloadUrl is absent', () => {
    const props = readProps('lift-report.json');
    const protocol = props.protocol as Record<string, unknown>;
    delete protocol.downloadUrl;

    renderReport(props);

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(document.querySelector('.a2ui-dfm')).toBeNull();
  });
});
