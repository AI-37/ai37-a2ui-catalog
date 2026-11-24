/**
 * Протокол «A2UI внутри MCP App», версия 1 (docs: plans/mcp-apps-a2ui-bridge.md).
 *
 * Поверхность едет в `_meta[A2UI_META_KEY]` результата инструмента, а не в
 * `structuredContent`: хост без UI отдаёт модели `structuredContent` вместо
 * `content`, и модель получила бы весь JSON формы. `_meta` модели не показывает
 * ни один хост.
 *
 * Файл без зависимостей: его читают и view (внутри HTML), и серверные помощники.
 */

/** Ключ в `_meta` результата инструмента. */
export const A2UI_META_KEY = 'ai37/a2ui';

/** Версия протокола: view отбрасывает payload другой версии. */
export const A2UI_APP_PROTOCOL_VERSION = 1;

/**
 * Префикс имени действия ресурсного канала. Чтение справочника или подбора
 * (`lookupHost`, `recommend`) view отправляет тем же `actionTool` с именем
 * `resource:<id>` — в песочнице хоста нет нашего origin и `/api/agent-resource`.
 */
export const A2UI_RESOURCE_ACTION_PREFIX = 'resource:';

/** Сообщение потока A2UI v0.9 (`createSurface`, `updateComponents`, …). */
export type A2uiAppMessage = Record<string, unknown>;

/** Поверхность в `_meta[A2UI_META_KEY]` результата инструмента. */
export type A2uiAppPayload = {
  version: typeof A2UI_APP_PROTOCOL_VERSION;
  /** Поток A2UI. Пустой — поверхность остаётся как есть (ответ на черновик). */
  messages: A2uiAppMessage[];
  surfaceId: string;
  /** Непрозрачное состояние документа агента: view возвращает его в каждом действии. */
  state: unknown;
  /** App-only инструмент, которым view отправляет действия поверхности. */
  actionTool: string;
};

/** Ответ ресурсного канала в `_meta[A2UI_META_KEY]`: тело, которое отдала бы ручка ресурса. */
export type A2uiResourcePayload = {
  version: typeof A2UI_APP_PROTOCOL_VERSION;
  resource: unknown;
};

/** Аргументы `actionTool`: действие поверхности или ресурсный запрос. */
export type A2uiAppActionArgs = {
  name: string;
  context: Record<string, unknown>;
  state: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readEnvelope(meta: unknown): Record<string, unknown> | undefined {
  const envelope = isRecord(meta) ? meta[A2UI_META_KEY] : undefined;
  if (!isRecord(envelope) || envelope.version !== A2UI_APP_PROTOCOL_VERSION) return undefined;
  return envelope;
}

/** Поверхность из `_meta` результата; чужой ключ, другая версия или битая форма — `undefined`. */
export function readA2uiAppPayload(meta: unknown): A2uiAppPayload | undefined {
  const envelope = readEnvelope(meta);
  if (envelope === undefined) return undefined;
  const {messages, surfaceId, actionTool} = envelope;
  if (!Array.isArray(messages) || typeof surfaceId !== 'string' || typeof actionTool !== 'string') {
    return undefined;
  }
  return {
    version: A2UI_APP_PROTOCOL_VERSION,
    messages: messages.filter(isRecord),
    surfaceId,
    state: envelope.state ?? null,
    actionTool,
  };
}

/** Тело ресурса из `_meta` результата; нет тела — `undefined`. */
export function readA2uiResource(meta: unknown): unknown {
  return readEnvelope(meta)?.resource;
}

/** `resource:<id>` → `<id>`; обычное действие поверхности — `undefined`. */
export function parseResourceActionName(name: string): string | undefined {
  if (!name.startsWith(A2UI_RESOURCE_ACTION_PREFIX)) return undefined;
  const id = name.slice(A2UI_RESOURCE_ACTION_PREFIX.length);
  return id.length > 0 ? id : undefined;
}
