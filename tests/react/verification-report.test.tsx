import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, SurfaceReadOnlyProvider} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function createSurface(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'VerificationReport', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  return processor.model.getSurface('demo-surface') as any;
}

function renderReport(props: Record<string, unknown>) {
  return render(<A2uiSurface surface={createSurface(props)} />);
}

/** Кнопка-раскрывашка строки: доступное имя начинается с названия проверки. */
function trigger(label: string) {
  return screen.getByRole('button', {name: new RegExp(`^${label}`)});
}

describe('VerificationReport', () => {
  it('шапка: пилюля вердикта, компания заголовком, подстрока', () => {
    const {container} = renderReport(readProps('verification-report-review.json'));

    const badge = container.querySelector('.a2ui-pill.a2ui-t--overline')!;
    expect(badge.textContent).toContain('Требует дополнительной проверки');
    expect(badge.className).toContain('a2ui-t--warning');
    expect(screen.getByRole('heading', {level: 3, name: 'ООО «Единая строительная компания»'}))
      .toBeTruthy();
    expect(screen.getByText('ИНН 7203350660 · Действует')).toBeTruthy();
    expect(screen.getByText('Проверки')).toBeTruthy();
  });

  it('строка с деталями раскрывается и показывает значения и источник', async () => {
    const {container} = renderReport(readProps('verification-report-review.json'));

    const okved = trigger('Профильный ОКВЭД');
    expect(okved.getAttribute('aria-expanded')).toBe('false');
    // Основание видно и в свёрнутом виде — ради него компонент и заведён.
    expect(okved.textContent).toContain('Совпали 2 профильных кода');

    await act(async () => {
      fireEvent.click(okved);
    });

    expect(okved.getAttribute('aria-expanded')).toBe('true');
    const panel = container.querySelector(`#${CSS.escape(okved.getAttribute('aria-controls')!)}`)!;
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(panel.textContent).toContain('Основной ОКВЭД');
    expect(panel.textContent).toContain('23.61 — Производство изделий из бетона');
    expect(panel.textContent).toContain('Источник:');
    expect(panel.textContent).toContain('ЕГРЮЛ');
  });

  it('раскрыть можно несколько строк сразу', async () => {
    renderReport(readProps('verification-report-review.json'));

    await act(async () => {
      fireEvent.click(trigger('Профильный ОКВЭД'));
    });
    await act(async () => {
      fireEvent.click(trigger('Финансовая отчётность'));
    });

    expect(trigger('Профильный ОКВЭД').getAttribute('aria-expanded')).toBe('true');
    expect(trigger('Финансовая отчётность').getAttribute('aria-expanded')).toBe('true');
  });

  it('строка без деталей и источников — не кнопка', () => {
    const {container} = renderReport(readProps('verification-report-review.json'));

    expect(screen.queryByRole('button', {name: /^ФГИС ЦС/})).toBeNull();
    expect(screen.queryByRole('button', {name: /^Наименование компании/})).toBeNull();
    expect(container.textContent).toContain('Точного совпадения по ИНН нет');
    // Восемь проверок: шесть с деталями раскрываются, две — строки.
    expect(container.querySelectorAll('[aria-expanded]')).toHaveLength(6);
  });

  it('слова статуса — из рендерера, ошибка красится провалом', () => {
    const props = readProps('verification-report-review.json');
    const checks = ['pass', 'fail', 'warning', 'error', 'skipped'].map(status => ({
      id: status,
      label: `Шаг ${status}`,
      status,
    }));
    const {container} = renderReport({...props, checks});

    const pills = [...container.querySelectorAll('.a2ui-pill:not(.a2ui-t--overline)')];
    expect(pills.map(pill => pill.textContent)).toEqual([
      'Пройдена',
      'Не пройдена',
      'Внимание',
      'Ошибка',
      'Пропущена',
    ]);
    expect(pills[3]!.className).toContain('a2ui-t--danger');
    expect(pills[4]!.className).toContain('a2ui-t--muted');
  });

  it('ссылкой становится только http(s)-источник', async () => {
    const props = readProps('verification-report-pass.json');
    const checks = [
      {
        id: 'revenue',
        label: 'Финансовая отчётность',
        status: 'pass',
        sources: [
          {label: 'ГИР БО (ФНС)', url: 'https://bo.nalog.ru/'},
          {label: 'Подозрительная', url: 'javascript:alert(1)'},
        ],
      },
    ];
    renderReport({...props, checks});

    await act(async () => {
      fireEvent.click(trigger('Финансовая отчётность'));
    });

    const link = screen.getByRole('link', {name: 'ГИР БО (ФНС)'});
    expect(link.getAttribute('href')).toBe('https://bo.nalog.ru/');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.queryByRole('link', {name: 'Подозрительная'})).toBeNull();
    expect(screen.getByText('Подозрительная')).toBeTruthy();
    expect(screen.getByText('Источники:')).toBeTruthy();
  });

  it('вердикт без проверок: секции нет, есть пояснение', () => {
    const {container} = renderReport(readProps('verification-report-fail.json'));

    expect(screen.queryByText('Проверки')).toBeNull();
    expect(container.querySelector('.a2ui-note')!.textContent).toContain(
      'Организация с таким ИНН не найдена',
    );
  });

  it('на прошлой поверхности раскрытие остаётся рабочим', async () => {
    render(
      <SurfaceReadOnlyProvider readOnly>
        <A2uiSurface surface={createSurface(readProps('verification-report-review.json'))} />
      </SurfaceReadOnlyProvider>,
    );

    await act(async () => {
      fireEvent.click(trigger('Статус в ЕГРЮЛ'));
    });

    expect(trigger('Статус в ЕГРЮЛ').getAttribute('aria-expanded')).toBe('true');
  });
});
