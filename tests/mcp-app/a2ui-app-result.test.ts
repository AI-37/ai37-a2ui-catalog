import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  A2UI_META_KEY,
  a2uiAppResult,
  a2uiResourceResult,
  parseResourceActionName,
  readA2uiAppPayload,
  readA2uiResource,
  type A2uiNode,
} from '../../packages/mcp-app-view/src/index';

/** Та же фикстура, что у Python-пары (tests/python/test_mcp_app.py): формат один на оба языка. */
const fixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'tests/mcp-app/a2ui-app-result.fixture.json'), 'utf8'),
) as {
  input: {text: string; surfaceId: string; actionTool: string; state: unknown; node: A2uiNode};
  expected: unknown;
};

function liftEditorNode(): A2uiNode {
  const props = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures/valid/lift-editor-per-lift.json'), 'utf8'),
  ).props as Record<string, unknown>;
  return {component: 'LiftEditorNext', props};
}

describe('a2uiAppResult', () => {
  it('даёт ровно формат протокола: текст в content, поверхность в _meta["ai37/a2ui"]', () => {
    const result = a2uiAppResult(fixture.input);

    expect(JSON.parse(JSON.stringify(result))).toStrictEqual(fixture.expected);
    expect(Object.keys(result._meta[A2UI_META_KEY])).toEqual([
      'version',
      'messages',
      'surfaceId',
      'state',
      'actionTool',
    ]);
  });

  it('content не содержит JSON формы — только переданный текст', () => {
    const text = 'Форма расчёта открыта. Предзаполнено: N=17, A=120.';
    const result = a2uiAppResult({
      text,
      node: liftEditorNode(),
      surfaceId: 'lift',
      actionTool: 'lift_form_action',
    });

    expect(result.content).toEqual([{type: 'text', text}]);
    const serialized = JSON.stringify(result.content);
    expect(serialized).not.toContain('LiftEditorNext');
    expect(serialized).not.toContain('methodConfigs');
    expect(JSON.stringify(result._meta)).toContain('methodConfigs');
  });

  it('готовый поток идёт как есть; пустой — ответ на черновик; нет состояния — null', () => {
    const draft = a2uiAppResult({text: '', messages: [], surfaceId: 'lift', actionTool: 'act'});

    expect(draft._meta[A2UI_META_KEY]).toStrictEqual({
      version: 1,
      messages: [],
      surfaceId: 'lift',
      state: null,
      actionTool: 'act',
    });
  });

  it('свой catalogId уходит в createSurface', () => {
    const result = a2uiAppResult({
      text: 't',
      node: {component: 'SimpleTable', props: {}},
      catalogId: 'urn:test:catalog',
      surfaceId: 's',
      actionTool: 'act',
    });

    expect(result._meta[A2UI_META_KEY].messages[0]).toEqual({
      version: 'v0.9',
      createSurface: {surfaceId: 's', catalogId: 'urn:test:catalog'},
    });
  });
});

describe('ресурсный канал', () => {
  it('a2uiResourceResult кладёт тело ручки в _meta, view его читает', () => {
    const body = {variants: [{id: 'v1'}]};
    const result = a2uiResourceResult(body);

    expect(result).toStrictEqual({
      content: [{type: 'text', text: ''}],
      _meta: {[A2UI_META_KEY]: {version: 1, resource: body}},
    });
    expect(readA2uiResource(result._meta)).toEqual(body);
  });

  it('parseResourceActionName отличает resource:<id> от действий поверхности', () => {
    expect(parseResourceActionName('resource:lift-recommend')).toBe('lift-recommend');
    expect(parseResourceActionName('resource:')).toBeUndefined();
    expect(parseResourceActionName('calc')).toBeUndefined();
  });
});

describe('readA2uiAppPayload', () => {
  it('читает результат помощника', () => {
    const result = a2uiAppResult(fixture.input);

    expect(readA2uiAppPayload(result._meta)).toEqual(result._meta[A2UI_META_KEY]);
  });

  it('другая версия, чужой ключ или битая форма — не наша поверхность', () => {
    const payload = a2uiAppResult(fixture.input)._meta[A2UI_META_KEY];

    expect(readA2uiAppPayload({[A2UI_META_KEY]: {...payload, version: 2}})).toBeUndefined();
    expect(readA2uiAppPayload({other: payload})).toBeUndefined();
    expect(readA2uiAppPayload({[A2UI_META_KEY]: {...payload, messages: 'x'}})).toBeUndefined();
    expect(readA2uiAppPayload(undefined)).toBeUndefined();
  });
});
