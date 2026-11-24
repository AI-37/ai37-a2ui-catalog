import {CATALOG_ID} from '@ai37/a2ui-catalog-schemas';
import {
  A2UI_APP_PROTOCOL_VERSION,
  A2UI_META_KEY,
  type A2uiAppMessage,
  type A2uiAppPayload,
  type A2uiResourcePayload,
} from './protocol';

/** Узел каталога, как его собирает агент: имя компонента и его props. */
export type A2uiNode = {
  component: string;
  props: Record<string, unknown>;
};

type A2uiAppResultBase = {
  /** Самодостаточный текст для модели и хоста без UI. JSON формы сюда не кладут. */
  text: string;
  surfaceId: string;
  actionTool: string;
  state?: unknown;
};

/** Вход `a2uiAppResult`: либо один корневой узел, либо готовый поток (пустой — для черновика). */
export type A2uiAppResultInput = A2uiAppResultBase &
  ({node: A2uiNode; catalogId?: string} | {messages: A2uiAppMessage[]});

/** Результат инструмента MCP с поверхностью в `_meta`. */
export type A2uiAppToolResult = {
  content: [{type: 'text'; text: string}];
  _meta: {[A2UI_META_KEY]: A2uiAppPayload};
};

/** Результат ресурсного действия `resource:<id>`. */
export type A2uiResourceToolResult = {
  content: [{type: 'text'; text: string}];
  _meta: {[A2UI_META_KEY]: A2uiResourcePayload};
};

/** Один узел → поток A2UI v0.9: `createSurface` и `updateComponents` с корнем `root`. */
export function a2uiSurfaceMessages(
  node: A2uiNode,
  surfaceId: string,
  catalogId: string = CATALOG_ID,
): A2uiAppMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId, catalogId}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: [{id: 'root', component: node.component, ...node.props}],
      },
    },
  ];
}

/**
 * Результат инструмента с view: текст для модели в `content`, поверхность — в
 * `_meta["ai37/a2ui"]`. В `_meta` всегда все пять полей протокола; нет
 * состояния — `state: null`.
 */
export function a2uiAppResult(input: A2uiAppResultInput): A2uiAppToolResult {
  const messages =
    'node' in input
      ? a2uiSurfaceMessages(input.node, input.surfaceId, input.catalogId)
      : input.messages;
  return {
    content: [{type: 'text', text: input.text}],
    _meta: {
      [A2UI_META_KEY]: {
        version: A2UI_APP_PROTOCOL_VERSION,
        messages,
        surfaceId: input.surfaceId,
        state: input.state ?? null,
        actionTool: input.actionTool,
      },
    },
  };
}

/** Ответ на `resource:<id>`: `resource` — то же тело, что отдала бы ручка `/api/agent-resource`. */
export function a2uiResourceResult(resource: unknown, text = ''): A2uiResourceToolResult {
  return {
    content: [{type: 'text', text}],
    _meta: {[A2UI_META_KEY]: {version: A2UI_APP_PROTOCOL_VERSION, resource}},
  };
}
