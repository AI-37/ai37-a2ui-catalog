import fs from 'node:fs';
import path from 'node:path';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  App,
  type McpUiDownloadFileRequest,
  type McpUiDownloadFileResult,
  type McpUiHostCapabilities,
  type McpUiHostContext,
} from '@modelcontextprotocol/ext-apps';
import {AppBridge} from '@modelcontextprotocol/ext-apps/app-bridge';
import {InMemoryTransport, type CallToolResult} from '@modelcontextprotocol/client';
import {
  a2uiAppResult,
  a2uiResourceResult,
  type A2uiAppActionArgs,
} from '../../packages/mcp-app-view/src/index';
import {
  startA2uiAppView,
  type A2uiAppView,
} from '../../packages/mcp-app-view/src/view/start-a2ui-app-view';

const ACTION_TOOL = 'lift_form_action';

function readProps(fileName: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function formResult(props: Record<string, unknown>, state: unknown = {doc: 'v1'}) {
  return a2uiAppResult({
    text: 'Форма расчёта открыта. Предзаполнено: N=17, A=340.',
    node: {component: 'LiftEditorNext', props: {...props, draftAction: 'calc:draft'}},
    surfaceId: 'lift',
    state,
    actionTool: ACTION_TOOL,
  });
}

function reportResult(text: string, headline: string, state: unknown) {
  const props = readProps('lift-report.json');
  const verdict = {...(props.verdict as Record<string, unknown>), headline};
  return a2uiAppResult({
    text,
    node: {component: 'LiftReportNext', props: {...props, verdict}},
    surfaceId: 'lift',
    state,
    actionTool: ACTION_TOOL,
  });
}

/** Ответ на черновик: поток пуст, документ обновлён. */
function draftResult(state: unknown) {
  return a2uiAppResult({text: '', messages: [], surfaceId: 'lift', state, actionTool: ACTION_TOOL});
}

type ToolHandler = (args: A2uiAppActionArgs) => CallToolResult;

type DownloadParams = McpUiDownloadFileRequest['params'];

/** Хост: контекст, возможности и ответ на `ui/download-file` (по умолчанию — согласие). */
type HostOptions = {
  hostContext?: McpUiHostContext;
  capabilities?: McpUiHostCapabilities;
  onDownload?: (params: DownloadParams) => McpUiDownloadFileResult | Promise<McpUiDownloadFileResult>;
};

type Host = {
  bridge: AppBridge;
  calls: Array<{tool: string; args: A2uiAppActionArgs}>;
  modelContext: string[];
  downloads: DownloadParams[];
  view: A2uiAppView;
  container: HTMLElement;
};

/**
 * Настоящие `App` (внутри view) и `AppBridge` (как у хоста) на линкованном
 * транспорте в памяти: проверяется протокол ui/*, а не наши заглушки.
 */
async function startHost(handler: ToolHandler, options: HostOptions = {}): Promise<Host> {
  const [hostTransport, viewTransport] = InMemoryTransport.createLinkedPair();
  const bridge = new AppBridge(
    null,
    {name: 'test-host', version: '1.0.0'},
    options.capabilities ?? {serverTools: {}},
    {hostContext: options.hostContext ?? {}},
  );
  const calls: Host['calls'] = [];
  const modelContext: string[] = [];
  const downloads: DownloadParams[] = [];
  bridge.ondownloadfile = async params => {
    downloads.push(params);
    return options.onDownload === undefined ? {} : options.onDownload(params);
  };
  bridge.oncalltool = async params => {
    const args = params.arguments as A2uiAppActionArgs;
    calls.push({tool: params.name, args});
    return handler(args);
  };
  bridge.onupdatemodelcontext = async params => {
    for (const block of params.content ?? []) {
      if (block.type === 'text') modelContext.push(block.text);
    }
    return {};
  };
  await bridge.connect(hostTransport);

  const container = document.createElement('div');
  document.body.append(container);
  // Авторазмер ходит через ResizeObserver, которого в jsdom нет; к протоколу поверхности он не относится.
  const app = new App({name: 'test-view', version: '0.0.0'}, {}, {autoResize: false});
  const view = await act(() => startA2uiAppView(app, container, viewTransport));
  return {bridge, calls, modelContext, downloads, view, container};
}

async function sendToolResult(host: Host, result: CallToolResult) {
  await act(async () => {
    await host.bridge.sendToolResult(result);
  });
}

/** Форма предзаполнена и проходится по секциям: «Рассчитать» появляется после «Далее». */
async function submitButton(): Promise<HTMLElement> {
  await screen.findByRole('button', {name: 'Далее'});
  for (let step = 0; step < 8 && screen.queryByRole('button', {name: 'Рассчитать'}) === null; step += 1) {
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Далее'}));
    });
  }
  return screen.getByRole('button', {name: 'Рассчитать'});
}

const unexpected: ToolHandler = args => {
  throw new Error(`неожиданный вызов ${args.name}`);
};

let host: Host | undefined;
let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(async () => {
  if (host !== undefined) {
    const {view, bridge, container} = host;
    act(() => view.root.unmount());
    await bridge.close();
    container.remove();
    host = undefined;
  }
  globalThis.fetch = originalFetch;
});

describe('view: результат инструмента', () => {
  it('рисует LiftEditorNext из _meta["ai37/a2ui"] и берёт тему хоста', async () => {
    host = await startHost(unexpected, {hostContext: {theme: 'dark'}});

    await sendToolResult(host, formResult(readProps('lift-editor-per-lift.json')));

    expect(await screen.findByRole('button', {name: 'Добавить лифт'})).toBeTruthy();
    expect(host.container.querySelector('[data-a2ui-theme="dark"]')).not.toBeNull();
  });

  it('смена темы у хоста доезжает до поверхности', async () => {
    host = await startHost(unexpected, {hostContext: {theme: 'light'}});
    await sendToolResult(host, formResult(readProps('lift-editor-per-lift.json')));
    await screen.findByRole('button', {name: 'Добавить лифт'});

    await act(async () => host!.bridge.setHostContext({theme: 'dark'}));

    await waitFor(() => {
      expect(host!.container.querySelector('[data-a2ui-theme="dark"]')).not.toBeNull();
    });
  });

  it('результат без нашего ключа поверхность не трогает', async () => {
    host = await startHost(unexpected);

    await sendToolResult(host, {content: [{type: 'text', text: 'просто текст'}]});

    expect(screen.getByText('Жду данных от агента…')).toBeTruthy();
  });
});

describe('view: действия поверхности', () => {
  it('«Рассчитать» → actionTool с {name, context, state}, отчёт перерисовывает, итог — модели', async () => {
    host = await startHost(args => {
      if (args.name === 'calc:draft') return draftResult(args.state);
      return args.name === 'calc'
        ? reportResult('Итог: не соответствует, интервал 220 с.', 'Интервал движения — 220 с', {doc: 'v2'})
        : reportResult('Итог: соответствует, интервал 73 с.', 'Интервал движения — 73 с', {doc: 'v3'});
    });
    await sendToolResult(host, formResult(readProps('lift-editor-per-lift.json')));

    fireEvent.click(await submitButton());

    expect(await screen.findByText('Интервал движения — 220 с')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Рассчитать'})).toBeNull();
    const turns = () => host!.calls.filter(call => call.args.name !== 'calc:draft');
    expect(turns()).toHaveLength(1);
    expect(turns()[0]!.tool).toBe(ACTION_TOOL);
    expect(turns()[0]!.args).toEqual({
      name: 'calc',
      context: expect.objectContaining({method: '52941'}),
      state: {doc: 'v1'},
    });
    await waitFor(() => expect(host!.modelContext).toEqual(['Итог: не соответствует, интервал 220 с.']));

    // «Пересчитать» на варианте отчёта — тот же канал с состоянием из ответа.
    fireEvent.click(screen.getAllByRole('button', {name: 'Пересчитать'})[0]!);

    expect(await screen.findByText('Интервал движения — 73 с')).toBeTruthy();
    expect(turns()[1]!.args).toEqual({
      name: 'report_apply_suggestion',
      context: expect.objectContaining({suggestionId: 'n3'}),
      state: {doc: 'v2'},
    });
    await waitFor(() => expect(host!.modelContext).toHaveLength(2));
  });

  it('черновик не пересоздаёт поверхность, но его state уходит со следующим действием', async () => {
    let drafts = 0;
    host = await startHost(() => {
      drafts += 1;
      return draftResult({doc: `draft-${drafts}`});
    });
    await sendToolResult(host, formResult(readProps('lift-editor-per-lift.json')));
    await screen.findByRole('button', {name: 'Добавить лифт'});
    const processor = host.view.session.getSnapshot().processor;

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Добавить лифт'}));
    });
    await waitFor(() => expect(host!.calls).toHaveLength(1));

    expect(host.calls[0]!.args).toMatchObject({name: 'calc:draft', state: {doc: 'v1'}});
    expect(host.view.session.getSnapshot().processor).toBe(processor);
    // Локальный ввод жив: секция, добавленная до черновика, на месте.
    expect(screen.getByRole('button', {name: /^Лифт 3(?!\d)/})).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Удалить лифт 3'}));
    });
    await waitFor(() => expect(host!.calls).toHaveLength(2));

    expect(host.calls[1]!.args.state).toEqual({doc: 'draft-1'});
    expect(host.view.session.getSnapshot().processor).toBe(processor);
    expect(host.modelContext).toEqual([]);
  });

  it('ошибка инструмента видна пользователю, форма остаётся', async () => {
    host = await startHost(() => ({content: [{type: 'text', text: 'Нет доступа к расчёту'}], isError: true}));
    await sendToolResult(host, formResult(readProps('lift-editor-per-lift.json')));

    fireEvent.click(await submitButton());

    expect((await screen.findByRole('alert')).textContent).toBe('Нет доступа к расчёту');
    expect(screen.getByRole('button', {name: 'Рассчитать'})).toBeTruthy();
    expect(host.modelContext).toEqual([]);
  });
});

describe('view: ресурсный канал', () => {
  it('подбор LiftEditorNext идёт через actionTool как resource:<id>, без сети', async () => {
    const variant = {
      id: 'v3-1000-16',
      title: 'ЩЛЗ ПП-1026ЕН · 3 лифта',
      subtitle: '1000 кг · 1,6 м/с',
      tone: 'ok',
      apply: {count: 3, values: {Q: '1000', Vn: '1.6'}},
    };
    // Сеть песочницы закрыта: подмена fetch во view встаёт поверх этой.
    let networkCalls = 0;
    globalThis.fetch = (async () => {
      networkCalls += 1;
      throw new Error('сеть в песочнице закрыта');
    }) as typeof fetch;
    host = await startHost(args =>
      args.name === 'resource:lift-recommend'
        ? a2uiResourceResult({variants: [variant]})
        : a2uiAppResult({text: '', messages: [], surfaceId: 'lift', state: {doc: 'v1'}, actionTool: ACTION_TOOL}),
    );

    await sendToolResult(host, formResult(readProps('lift-editor-recommend.json')));

    expect(await screen.findByText(variant.title, {}, {timeout: 2000})).toBeTruthy();
    const resourceCall = host.calls.find(call => call.args.name === 'resource:lift-recommend');
    expect(resourceCall).toEqual({
      tool: ACTION_TOOL,
      args: {
        name: 'resource:lift-recommend',
        context: expect.objectContaining({N: '17', A: '340'}),
        state: {doc: 'v1'},
      },
    });
    expect(networkCalls).toBe(0);
    expect(host.modelContext).toEqual([]);
  });
});

describe('view: скачивание протокола через хост', () => {
  const DOWNLOAD_HOST: McpUiHostCapabilities = {serverTools: {}, downloadFile: {}};

  function protocolTextResult() {
    return a2uiAppResult({
      text: 'Итог: не соответствует, интервал 220 с.',
      node: {component: 'LiftReportNext', props: readProps('lift-report-protocol-text.json')},
      surfaceId: 'lift',
      state: {doc: 'v2'},
      actionTool: ACTION_TOOL,
    });
  }

  async function chooseMarkdown(): Promise<void> {
    const trigger = await screen.findByRole('button', {name: /^Скачать/});
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

  it('«Скачать → .md» уходит хосту как ui/download-file с text/markdown', async () => {
    host = await startHost(unexpected, {capabilities: DOWNLOAD_HOST});
    await sendToolResult(host, protocolTextResult());

    await chooseMarkdown();

    await waitFor(() => expect(host!.downloads).toHaveLength(1));
    const protocol = readProps('lift-report-protocol-text.json').protocol as {downloadContent: string};
    expect(host.downloads[0]).toEqual({
      contents: [
        {
          type: 'resource',
          resource: {
            uri: `file:///${encodeURIComponent('протокол-лифты-ГОСТ-Р-52941.md')}`,
            mimeType: 'text/markdown',
            text: protocol.downloadContent,
          },
        },
      ],
    });
    // Хост скачивает сам: ни вызова агента, ни ошибки на экране.
    expect(host.calls).toEqual([]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('хост без capability downloadFile — пункта «Скачать» нет', async () => {
    host = await startHost(unexpected);
    await sendToolResult(host, protocolTextResult());

    expect(await screen.findByText('Протокол расчёта')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^Скачать/})).toBeNull();
    expect(host.downloads).toEqual([]);
  });

  it('отмена в диалоге хоста (isError) — без ошибки на экране', async () => {
    host = await startHost(unexpected, {capabilities: DOWNLOAD_HOST, onDownload: () => ({isError: true})});
    await sendToolResult(host, protocolTextResult());

    await chooseMarkdown();

    await waitFor(() => expect(host!.downloads).toHaveLength(1));
    // Ответ хоста дошёл и обработан — а экран чист.
    await act(async () => {});
    expect(screen.queryByRole('alert')).toBeNull();
    expect(host.view.session.getSnapshot().error).toBeUndefined();
  });

  it('оборванный вызов хоста — видимая ошибка, отчёт на месте', async () => {
    host = await startHost(unexpected, {
      capabilities: DOWNLOAD_HOST,
      onDownload: () => {
        throw new Error('диалог закрыт');
      },
    });
    await sendToolResult(host, protocolTextResult());

    await chooseMarkdown();

    expect((await screen.findByRole('alert')).textContent).toMatch(/^Не удалось скачать файл: /);
    expect(screen.getByText('Интервал движения — 220 с')).toBeTruthy();
  });
});
