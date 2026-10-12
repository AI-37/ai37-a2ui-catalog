import {CHAT_ATTACHMENTS_ROUTE} from '@ai37/a2ui-catalog-schemas';

/**
 * Локальная имитация ручки загрузки вложений хоста для AttachmentChoiceCard.
 *
 * В demo нет BFF spai-ui, поэтому POST `CHAT_ATTACHMENTS_ROUTE` перехватывается
 * обёрткой над `fetch`: пауза, как у настоящей загрузки, и ответ `{fileId, bytes}`.
 * Файл с «fail» в имени отвечает 500 — так виден сценарий ошибки.
 */
export function attachDemoAttachmentHost(): void {
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.endsWith(CHAT_ATTACHMENTS_ROUTE) || init?.method !== 'POST') {
      return original(input, init);
    }
    const file = (init.body as FormData).get('file') as File;
    await new Promise(resolve => setTimeout(resolve, 900));
    if (file.name.includes('fail')) return new Response('demo failure', {status: 500});
    const fileId = `demo_${Math.random().toString(36).slice(2, 10)}`;
    return new Response(JSON.stringify({fileId, bytes: file.size}), {status: 200});
  };
}
