import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, SurfaceReadOnlyProvider} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(name = 'attachment-choice-card-signature.json') {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'fixtures', 'valid', name),
      'utf8',
    ),
  ).props as Record<string, unknown>;
}

function createSurface(props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component: 'AttachmentChoiceCard', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as any;
  const actions: unknown[] = [];
  surface.onAction.subscribe((action: unknown) => actions.push(action));
  return {surface, actions};
}

function renderCard(readOnly?: boolean, props = readProps()) {
  const {surface, actions} = createSurface(props);
  const tree = <A2uiSurface surface={surface} />;
  const view = render(
    readOnly === undefined ? tree : <SurfaceReadOnlyProvider readOnly={readOnly}>{tree}</SurfaceReadOnlyProvider>,
  );
  return {...view, actions};
}

const skip = () => screen.getByRole('button', {name: 'Продолжить без подписи'});
const attach = () => screen.getByRole('button', {name: 'Продолжить с подписью'});
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'signature.png', {type: 'image/png'});

function mockUpload(response: Response | Promise<Response>) {
  const fetchMock = vi.fn().mockReturnValue(Promise.resolve(response));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AttachmentChoiceCard', () => {
  it('«с подписью» неактивна, пока файл не выбран; «без подписи» активна', () => {
    renderCard();
    expect((attach() as HTMLButtonElement).disabled).toBe(true);
    expect((skip() as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByRole('button', {name: 'Выбрать PNG…'})).toBeTruthy();
  });

  it('«без подписи» шлёт {value} и гасит обе кнопки', async () => {
    const {actions} = renderCard();
    await act(async () => fireEvent.click(skip()));
    expect(actions).toHaveLength(1);
    expect(JSON.stringify(actions[0])).toContain('"value":"nosign"');
    expect(JSON.stringify(actions[0])).not.toContain('fileId');
    expect((skip() as HTMLButtonElement).disabled).toBe(true);
  });

  it('выбор файла грузит его на полку треда и включает «с подписью»', async () => {
    const fetchMock = mockUpload(
      new Response(JSON.stringify({fileId: 'f_7c1e', bytes: 165368}), {status: 200}),
    );
    const {container, actions} = renderCard();

    await act(async () => fireEvent.change(fileInput(container), {target: {files: [png()]}}));
    await waitFor(() => expect((attach() as HTMLButtonElement).disabled).toBe(false));

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/chat-attachments');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body.get('contextId')).toBe('c5e3fd33-3e9c-4250-9032-9a33f25169d6');
    expect((body.get('file') as File).name).toBe('signature.png');
    expect(screen.getByText(/signature\.png · 161 KB/)).toBeTruthy();

    await act(async () => fireEvent.click(attach()));
    expect(actions).toHaveLength(1);
    const sent = JSON.stringify(actions[0]);
    expect(sent).toContain('"value":"withsign"');
    expect(sent).toContain('"fileId":"f_7c1e"');
    expect(sent).toContain('"fileName":"signature.png"');
  });

  it('пока файл грузится, обе кнопки неактивны', async () => {
    mockUpload(new Promise<Response>(() => {}));
    const {container} = renderCard();
    await act(async () => fireEvent.change(fileInput(container), {target: {files: [png()]}}));
    expect(screen.getByRole('status').textContent).toContain('signature.png');
    expect((skip() as HTMLButtonElement).disabled).toBe(true);
    expect((attach() as HTMLButtonElement).disabled).toBe(true);
  });

  it('сбой загрузки — ошибка под строкой, выбор доступен снова', async () => {
    mockUpload(new Response('nope', {status: 500}));
    const {container} = renderCard();
    await act(async () => fireEvent.change(fileInput(container), {target: {files: [png()]}}));
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect((attach() as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', {name: 'Выбрать PNG…'})).toBeTruthy();
  });

  it('крестик убирает файл и снова гасит «с подписью»', async () => {
    mockUpload(new Response(JSON.stringify({fileId: 'f_1', bytes: 2048}), {status: 200}));
    const {container} = renderCard();
    await act(async () => fireEvent.change(fileInput(container), {target: {files: [png()]}}));
    await waitFor(() => expect((attach() as HTMLButtonElement).disabled).toBe(false));
    await act(async () => fireEvent.click(screen.getByRole('button', {name: 'Убрать signature.png'})));
    expect((attach() as HTMLButtonElement).disabled).toBe(true);
  });

  it('на прошлой поверхности карточка заглушена', () => {
    const {container} = renderCard(true);
    expect(container.querySelector('[inert]')).toBeTruthy();
  });

  describe('без skip', () => {
    const renderAttachOnly = () => renderCard(undefined, readProps('attachment-choice-card-attach-only.json'));
    const proceed = () => screen.getByRole('button', {name: 'Продолжить'});

    it('кнопка одна — «Продолжить», неактивна до загрузки файла', () => {
      renderAttachOnly();
      expect(screen.queryByRole('button', {name: /без/})).toBeNull();
      expect((proceed() as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByRole('button', {name: 'Выбрать файл…'})).toBeTruthy();
    });

    it('после загрузки «Продолжить» шлёт {value, fileId, fileName}', async () => {
      mockUpload(new Response(JSON.stringify({fileId: 'f_calc', bytes: 2048}), {status: 200}));
      const {container, actions} = renderAttachOnly();
      const pdf = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'calc.pdf', {type: 'application/pdf'});

      await act(async () => fireEvent.change(fileInput(container), {target: {files: [pdf]}}));
      await waitFor(() => expect((proceed() as HTMLButtonElement).disabled).toBe(false));
      await act(async () => fireEvent.click(proceed()));

      expect(actions).toHaveLength(1);
      const sent = JSON.stringify(actions[0]);
      expect(sent).toContain('"name":"verify_file"');
      expect(sent).toContain('"value":"verify"');
      expect(sent).toContain('"fileId":"f_calc"');
      expect(sent).toContain('"fileName":"calc.pdf"');
      expect((proceed() as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
