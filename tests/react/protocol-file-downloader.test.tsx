import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {
  ArtifactCardHostProvider,
  ai37Catalog,
  type ArtifactCardHost,
  type TextFile,
} from '@ai37/a2ui-catalog-react';

/**
 * Протокол текстом (`downloadFileName`) скачивается через одну точку —
 * загрузчик хоста (`ArtifactCardHost.downloadFile`). Не задан — клиентский
 * Blob, как было; функция — она вместо Blob'а (MCP App: `ui/download-file`);
 * `null` — «Скачать» у такого протокола нет.
 */

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

type Props = Record<string, unknown>;
type Protocol = {content: string; downloadFileName?: string; downloadContent?: string};

function readProps(fileName: string): Props {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Props;
}

function renderReport(component: string, props: Props, host?: ArtifactCardHost) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {surfaceId: 'demo-surface', components: [{id: 'root', component, ...props}]},
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as never;
  const tree = <A2uiSurface surface={surface} />;
  return render(host === undefined ? tree : <ArtifactCardHostProvider value={host}>{tree}</ArtifactCardHostProvider>);
}

async function chooseMarkdown(): Promise<void> {
  const trigger = screen.getByRole('button', {name: /^Скачать/});
  await act(async () => {
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
  const items = screen.getAllByRole('menuitem');
  expect(items.map(item => item.textContent)).toEqual(['Markdown (.md)']);
  await act(async () => {
    fireEvent.click(items[0]!);
  });
}

/** У Blob в jsdom нет `text()` — читаем по-старому. */
function readBlob(blob: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}

function recordingHost(): {host: ArtifactCardHost; files: TextFile[]} {
  const files: TextFile[] = [];
  return {host: {downloadFile: file => void files.push(file)}, files};
}

// Blob-загрузчик по умолчанию: ловим createObjectURL и читаем, что ушло в файл.
let blobs: Blob[] = [];
let originalCreate: typeof URL.createObjectURL;
let originalRevoke: typeof URL.revokeObjectURL;

beforeEach(() => {
  blobs = [];
  originalCreate = URL.createObjectURL;
  originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = (blob: Blob) => {
    blobs.push(blob);
    return 'blob:demo';
  };
  URL.revokeObjectURL = () => {};
});

afterEach(() => {
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
});

const liftProps = () => readProps('lift-report-protocol-text.json');
const liftProtocol = (props: Props) => props.protocol as Protocol;

describe('LiftReportNext: протокол текстом', () => {
  it('«Скачать → .md» отдаёт загрузчику хоста имя и downloadContent', async () => {
    const props = liftProps();
    const {host, files} = recordingHost();
    renderReport('LiftReportNext', props, host);

    await chooseMarkdown();

    expect(files).toEqual([
      {
        fileName: 'протокол-лифты-ГОСТ-Р-52941.md',
        mimeType: 'text/markdown',
        text: liftProtocol(props).downloadContent,
      },
    ]);
    // Подменённый загрузчик идёт вместо Blob'а, а не вместе с ним.
    expect(blobs).toHaveLength(0);
  });

  it('без downloadContent в файл уходит content', async () => {
    const props = liftProps();
    const {downloadContent: _full, ...protocol} = liftProtocol(props);
    const {host, files} = recordingHost();
    renderReport('LiftReportNext', {...props, protocol}, host);

    await chooseMarkdown();

    expect(files).toHaveLength(1);
    expect(files[0]!.text).toBe(protocol.content);
  });

  it('загрузчик по умолчанию — клиентский Blob с той же простынёй', async () => {
    const props = liftProps();
    renderReport('LiftReportNext', props);

    await chooseMarkdown();

    expect(blobs).toHaveLength(1);
    expect(blobs[0]!.type).toContain('text/markdown');
    expect(await readBlob(blobs[0]!)).toBe(liftProtocol(props).downloadContent);
  });

  it('хост скачивать не умеет (null) — триггера нет, протокол на месте', () => {
    renderReport('LiftReportNext', liftProps(), {downloadFile: null});

    expect(screen.getByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Скачать/})).toBeNull();
  });

  it('downloadUrl главнее: меню ссылок есть и у хоста без загрузчика', async () => {
    renderReport('LiftReportNext', readProps('lift-report.json'), {downloadFile: null});

    const trigger = screen.getByRole('button', {name: /^Скачать/});
    await act(async () => {
      trigger.focus();
      fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    });

    expect(screen.getAllByRole('menuitem').map(item => item.textContent)).toEqual([
      'Markdown (.md)',
      'Word (.docx)',
    ]);
  });
});

describe('Однокнопочные протоколы: та же точка загрузчика', () => {
  const cases: Array<[string, string]> = [
    ['ThermalReport', 'thermal-report-single.json'],
    ['KeoReport', 'keo-report-fail.json'],
    ['InsolationReport', 'insolation-report-pass.json'],
    ['LiftReport', 'lift-report-protocol-text.json'],
  ];

  it.each(cases)('%s: подменённый загрузчик вместо Blob', (component, fixture) => {
    const props = readProps(fixture);
    const protocol = props.protocol as Protocol;
    const {host, files} = recordingHost();
    renderReport(component, props, host);

    fireEvent.click(screen.getByRole('button', {name: 'Скачать'}));

    expect(files).toEqual([
      {
        fileName: protocol.downloadFileName,
        mimeType: 'text/markdown',
        text: protocol.downloadContent ?? protocol.content,
      },
    ]);
    expect(blobs).toHaveLength(0);
  });

  it.each(cases)('%s: хост без загрузчика — кнопки нет', (component, fixture) => {
    renderReport(component, readProps(fixture), {downloadFile: null});

    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
  });

  it('LiftReport: Blob по умолчанию и прежнее меню при downloadUrl', () => {
    const {unmount} = renderReport('LiftReport', liftProps());
    fireEvent.click(screen.getByRole('button', {name: 'Скачать'}));
    expect(blobs).toHaveLength(1);
    unmount();

    // При downloadUrl — прежнее меню форматов ссылками: Blob не создаётся.
    const {container} = renderReport('LiftReport', readProps('lift-report.json'));
    expect(container.querySelector('.a2ui-dfm a[role="menuitem"]')?.getAttribute('href')).toBe(
      '/api/agent-resource?resource=lift-report&taskId=t1',
    );
    expect(screen.queryByRole('button', {name: 'Скачать'})).toBeNull();
    expect(blobs).toHaveLength(1);
  });
});
