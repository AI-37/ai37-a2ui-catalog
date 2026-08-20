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
        components: [{id: 'root', component: 'ThermalReport', ...props}],
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

describe('ThermalReport', () => {
  it('renders single-construction filling: verdict, checks, layers table, protocol', () => {
    const {container} = renderReport(readProps('thermal-report-single.json'));

    expect(screen.getByText('R₀ приведённое — 3,21 м²·°С/Вт')).toBeTruthy();
    expect(screen.getByText('Поэлементное требование')).toBeTruthy();
    // pass-статусы у двух проверок; info-строка (kоб) — без статуса.
    expect(screen.getAllByText('Соответствует')).toHaveLength(2);
    expect(screen.getByText('Минераловатная плита')).toBeTruthy();
    expect(
      screen.getByText('R₀ приведённое · с сопротивлениями поверхностей и r 0,92'),
    ).toBeTruthy();
    // Протокол — одна строка без раскрытия: content в UI не показывается.
    const protocol = container.querySelector('.a2ui-tr__protocol')!;
    expect(protocol.tagName).not.toBe('DETAILS');
    expect(container.querySelector('details')).toBeNull();
    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(protocol.textContent).not.toContain('ГСОП');
  });

  it('renders list filling: deviation chips by sign, actions only where given', () => {
    renderReport(readProps('thermal-report-multi.json'));

    expect(screen.getByText('Соответствуют 2 конструкции из 7')).toBeTruthy();
    // Отклонения форматируются рендерером: знак, запятая, один знак после неё.
    expect(screen.getByText('−53,9 %')).toBeTruthy();
    expect(screen.getByText('+0,6 %')).toBeTruthy();
    // «Подобрать» — только у пяти непроходящих.
    expect(screen.getAllByRole('button', {name: 'Подобрать'})).toHaveLength(5);
    expect(screen.getByText('Кровли и полы лоджий · 3 конструкции')).toBeTruthy();
  });

  it('dispatches actions with payload', async () => {
    const {actions} = renderReport(readProps('thermal-report-multi.json'));

    // dispatchAction доставляет action микротаском — щёлкаем под act и ждём.
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', {name: 'Подобрать'})[0]);
      fireEvent.click(screen.getByRole('button', {name: 'Изменить и пересчитать'}));
      fireEvent.click(screen.getByRole('button', {name: 'Вернуть в расчёт'}));
    });

    expect(actions).toHaveLength(3);
    expect(actions[0]!.name).toBe('report_fix_construction');
    expect(actions[0]!.context).toMatchObject({constructionId: 'c1'});
    expect(actions[1]!.name).toBe('report_edit_inputs');
    expect(actions[2]!.name).toBe('report_restore_excluded');
  });

  it('downloads protocol as client-side blob', () => {
    const created: string[] = [];
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = (blob: Blob) => {
      created.push(blob.type);
      return 'blob:demo';
    };
    URL.revokeObjectURL = () => {};

    try {
      renderReport(readProps('thermal-report-single.json'));

      fireEvent.click(screen.getByRole('button', {name: 'Скачать'}));

      expect(created).toHaveLength(1);
      expect(created[0]).toContain('text/markdown');
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });

  it('downloadUrl → dropdown форматов: .md прямой ссылкой, .docx через конверт-сервис', () => {
    const props = readProps('thermal-report-single.json');
    const protocol = props.protocol as Record<string, unknown>;
    protocol.downloadUrl = '/api/agent-resource?resource=teplo-report&taskId=t1';

    const {container} = renderReport(props);

    const items = container.querySelectorAll<HTMLAnchorElement>('.a2ui-dfm__item');
    expect(items).toHaveLength(2);
    expect(items[0]!.getAttribute('href')).toBe(
      '/api/agent-resource?resource=teplo-report&taskId=t1',
    );
    expect(items[1]!.getAttribute('href')).toBe(
      '/api/agent-resource/convert?format=docx&resource=teplo-report&taskId=t1',
    );
    // Blob-кнопки при dropdown нет — путь через сервер, не через клиент.
    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
  });

  it('downloadUrl чужой формы → только пункт .md, без convert-ссылки', () => {
    const props = readProps('thermal-report-single.json');
    (props.protocol as Record<string, unknown>).downloadUrl = 'https://elsewhere.example/file.md';

    const {container} = renderReport(props);

    const items = container.querySelectorAll<HTMLAnchorElement>('.a2ui-dfm__item');
    expect(items).toHaveLength(1);
    expect(items[0]!.getAttribute('href')).toBe('https://elsewhere.example/file.md');
  });

  it('omits the download link when downloadFileName is absent', () => {
    const props = readProps('thermal-report-single.json');
    const protocol = props.protocol as Record<string, unknown>;
    delete protocol.downloadFileName;
    delete protocol.downloadContent;

    renderReport(props);

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
  });

  it('marks system-assumed inputs group with warning tone', () => {
    const {container} = renderReport(readProps('thermal-report-single.json'));

    const warningGroup = container.querySelector('.a2ui-tr__group--warning')!;
    expect(warningGroup.textContent).toContain('Принято системой — проверьте');
    expect(warningGroup.textContent).toContain('Условия эксплуатации');
  });
});
