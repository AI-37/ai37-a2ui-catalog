import {describe, expect, it, vi} from 'vitest';
import type {App} from '@modelcontextprotocol/ext-apps';
import type {CallToolResult} from '@modelcontextprotocol/client';
import {LOOKUP_SUGGEST_ACTION} from '@ai37/a2ui-catalog-schemas';
import {a2uiAppResult} from '../../packages/mcp-app-view/src/index';
import {A2uiAppSession} from '../../packages/mcp-app-view/src/view/a2ui-app-session';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

const FORM = a2uiAppResult({
  text: 'Форма открыта.',
  node: {component: 'Text', props: {text: 'форма'}},
  catalogId: CATALOG_ID,
  surfaceId: 'lift',
  state: {doc: 'v1'},
  actionTool: 'act',
});

function draft(state: unknown) {
  return a2uiAppResult({text: '', messages: [], surfaceId: 'lift', state, actionTool: 'act'});
}

/**
 * Ветки сессии, до которых через живую форму не дотянуться детерминированно:
 * порядок ответов, правка поверхности без пересоздания, битый поток.
 */
function sessionWith(callServerTool: (args: unknown) => Promise<CallToolResult>) {
  const app = {callServerTool: vi.fn(callServerTool), updateModelContext: vi.fn(async () => ({}))};
  const session = new A2uiAppSession(app as unknown as App);
  session.showToolResult(FORM);
  return {app, session};
}

function deferred() {
  let resolve!: (value: CallToolResult) => void;
  const promise = new Promise<CallToolResult>(done => {
    resolve = done;
  });
  return {promise, resolve};
}

describe('A2uiAppSession', () => {
  it('поздний ответ на черновик не затирает состояние, пришедшее позже по времени отправки', async () => {
    const slow = deferred();
    const fast = deferred();
    const pending = [slow, fast, deferred()];
    const {app, session} = sessionWith(() => pending.shift()!.promise);

    const first = session.handleAction({name: 'calc:draft', context: {}});
    const second = session.handleAction({name: 'calc:draft', context: {}});
    fast.resolve(draft({doc: 'второй'}));
    await second;
    slow.resolve(draft({doc: 'первый'}));
    await first;

    // Третий ход уходит с тем состоянием, что приняла сессия; ответ на него не нужен.
    void session.handleAction({name: 'calc:draft', context: {}});
    expect(app.callServerTool.mock.calls[2]![0]).toMatchObject({arguments: {state: {doc: 'второй'}}});
  });

  it('тихое действие lookup правит текущую поверхность без хода и без сообщения модели', async () => {
    const {app, session} = sessionWith(async () =>
      a2uiAppResult({
        text: '',
        messages: [
          {version: 'v0.9', updateDataModel: {surfaceId: 'lift', path: '/lookup/city', value: {options: []}}},
        ],
        surfaceId: 'lift',
        state: {doc: 'v1'},
        actionTool: 'act',
      }),
    );
    const processor = session.getSnapshot().processor;
    const busy: boolean[] = [];
    session.subscribe(() => busy.push(session.getSnapshot().busy));

    await session.handleAction({name: LOOKUP_SUGGEST_ACTION, context: {fieldName: 'city', query: 'мос'}});

    expect(session.getSnapshot().processor).toBe(processor);
    expect(processor!.model.getSurface('lift')!.dataModel.get('/lookup/city')).toEqual({options: []});
    expect(busy).not.toContain(true);
    expect(app.updateModelContext).not.toHaveBeenCalled();
  });

  it('битый поток не роняет view: ошибка видна, прежняя поверхность на месте', () => {
    const {session} = sessionWith(async () => FORM);
    const processor = session.getSnapshot().processor;

    session.showToolResult(
      a2uiAppResult({
        text: '',
        messages: [{version: 'v0.9', createSurface: {surfaceId: 'lift', catalogId: 'urn:нет-такого'}}],
        surfaceId: 'lift',
        actionTool: 'act',
      }),
    );

    expect(session.getSnapshot().error).toMatch(/^Не удалось показать поверхность/);
    expect(session.getSnapshot().processor).toBe(processor);
  });

  it('сбой транспорта на ходе — ошибка пользователю, индикатор хода снят', async () => {
    const {session} = sessionWith(async () => {
      throw new Error('хост недоступен');
    });

    await session.handleAction({name: 'calc', context: {}});

    expect(session.getSnapshot()).toMatchObject({busy: false, error: 'хост недоступен'});
  });
});
