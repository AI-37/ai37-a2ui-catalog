import {AGENT_RESOURCE_ROUTE} from '@ai37/a2ui-catalog-schemas';

/** Запрос ресурса агента: id из `resource=`, остальные параметры query — контекстом. */
export type ResourceRequest = (id: string, context: Record<string, string>) => Promise<unknown>;

type ResourceQuery = {id: string; context: Record<string, string>};

const JSON_HEADERS = {'content-type': 'application/json'};

/**
 * Рендереры каталога читают справочники и подбор same-origin GET
 * `/api/agent-resource?resource=…` (`useLookupSuggest`, `useRecommendVariants`).
 * В песочнице хоста MCP Apps такого origin нет. Точка подмены — сам `fetch`
 * страницы: рендереры не меняются, а запрос уходит в `actionTool` как
 * `resource:<id>`. POST и другие адреса идут как раньше.
 */
export function installResourceFetch(scope: typeof globalThis, request: ResourceRequest): void {
  const original = scope.fetch.bind(scope);
  scope.fetch = (input, init) => {
    const query = readResourceQuery(input, init);
    if (query === undefined) return original(input, init);
    return abortable(request(query.id, query.context).then(toResponse), init?.signal);
  };
}

function readResourceQuery(input: unknown, init: RequestInit | undefined): ResourceQuery | undefined {
  if (typeof input !== 'string' || !input.startsWith(`${AGENT_RESOURCE_ROUTE}?`)) return undefined;
  if ((init?.method ?? 'GET').toUpperCase() !== 'GET') return undefined;
  const params = new URLSearchParams(input.slice(AGENT_RESOURCE_ROUTE.length + 1));
  const id = params.get('resource');
  if (id === null || id.length === 0) return undefined;
  params.delete('resource');
  return {id, context: Object.fromEntries(params)};
}

/** Ответ агента — 200 с телом; пусто — 404, как у ручки ресурсов для неизвестного id. */
function toResponse(body: unknown): Response {
  if (body === undefined) {
    return new Response(JSON.stringify({error: 'unknown_resource'}), {status: 404, headers: JSON_HEADERS});
  }
  return new Response(JSON.stringify(body), {status: 200, headers: JSON_HEADERS});
}

/** Рендерер гасит устаревший запрос `AbortController`'ом: отвечаем так же, как настоящий `fetch`. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal | null | undefined): Promise<T> {
  if (signal == null) return promise;
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new DOMException('Запрос отменён', 'AbortError'));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, {once: true});
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}
