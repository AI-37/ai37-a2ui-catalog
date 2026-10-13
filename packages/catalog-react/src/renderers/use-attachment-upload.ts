import React from 'react';
import {CHAT_ATTACHMENTS_ROUTE} from '@ai37/a2ui-catalog-schemas';
import type {AttachmentUpload, UseAttachmentUpload} from './attachment-choice-card.types';

const UPLOAD_FAILED = 'Не удалось загрузить файл. Выберите его ещё раз.';

/**
 * Загрузка файла из карточки на полку треда: same-origin multipart POST
 * `CHAT_ATTACHMENTS_ROUTE` с `{file, contextId}` — та же ручка, что у «+»
 * композера, поэтому файл ложится туда же и виден агенту как
 * `chat-attachment:<fileId>`. В очередь композера файл не попадает: чипа над
 * полем ввода не остаётся. Канон канала — `use-lookup-suggest.ts`:
 * AbortController, unmount отменяет запрос, сбой — состояние `error`.
 */
export function useAttachmentUpload(contextId: string): UseAttachmentUpload {
  const [upload, setUpload] = React.useState<AttachmentUpload>({status: 'idle'});
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const pick = (file: File) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({status: 'uploading', fileName: file.name});
    void send(file, contextId, controller).then(next => {
      if (!controller.signal.aborted) setUpload(next);
    });
  };

  const clear = () => {
    abortRef.current?.abort();
    setUpload({status: 'idle'});
  };

  return {upload, pick, clear};
}

async function send(
  file: File,
  contextId: string,
  controller: AbortController,
): Promise<AttachmentUpload> {
  const form = new FormData();
  form.append('file', file);
  form.append('contextId', contextId);
  try {
    const response = await fetch(CHAT_ATTACHMENTS_ROUTE, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) return {status: 'error', message: UPLOAD_FAILED};
    const body = (await response.json()) as {fileId?: unknown; bytes?: unknown};
    if (typeof body.fileId !== 'string' || body.fileId === '') {
      return {status: 'error', message: UPLOAD_FAILED};
    }
    const bytes = typeof body.bytes === 'number' ? body.bytes : file.size;
    return {status: 'ready', fileId: body.fileId, fileName: file.name, bytes};
  } catch {
    return {status: 'error', message: UPLOAD_FAILED};
  }
}
