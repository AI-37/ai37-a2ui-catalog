import {describe, expect, it, vi} from 'vitest';
import {installResourceFetch} from '../../packages/mcp-app-view/src/view/resource-fetch';

function scopeWithFetch() {
  const network = vi.fn(async () => new Response('сеть'));
  const scope = {fetch: network} as unknown as typeof globalThis;
  return {scope, network};
}

describe('installResourceFetch', () => {
  it('GET /api/agent-resource уходит в запрос ресурса: id из resource=, остальное — контекстом', async () => {
    const {scope, network} = scopeWithFetch();
    const request = vi.fn(async () => ({options: [{value: 'msk', label: 'Москва'}]}));
    installResourceFetch(scope, request);

    const response = await scope.fetch('/api/agent-resource?resource=cities&query=%D0%BC%D0%BE%D1%81');

    expect(request).toHaveBeenCalledWith('cities', {query: 'мос'});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({options: [{value: 'msk', label: 'Москва'}]});
    expect(network).not.toHaveBeenCalled();
  });

  it('пустой ответ агента — 404 unknown_resource, как у ручки ресурсов', async () => {
    const {scope} = scopeWithFetch();
    installResourceFetch(scope, async () => undefined);

    const response = await scope.fetch('/api/agent-resource?resource=nope');

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({error: 'unknown_resource'});
  });

  it('POST, другие адреса и запрос без resource= идут в сеть как раньше', async () => {
    const {scope, network} = scopeWithFetch();
    const request = vi.fn();
    installResourceFetch(scope, request);

    await scope.fetch('/api/agent-resource?resource=keo', {method: 'POST', body: '{}'});
    await scope.fetch('/api/chat/attachments');
    await scope.fetch('/api/agent-resource?query=x');

    expect(request).not.toHaveBeenCalled();
    expect(network).toHaveBeenCalledTimes(3);
  });

  it('отмена запроса — AbortError, как у настоящего fetch', async () => {
    const {scope} = scopeWithFetch();
    installResourceFetch(scope, () => new Promise(() => undefined));
    const controller = new AbortController();

    const pending = scope.fetch('/api/agent-resource?resource=lift-recommend&N=17', {
      signal: controller.signal,
    });
    controller.abort();

    await expect(pending).rejects.toMatchObject({name: 'AbortError'});
  });
});
