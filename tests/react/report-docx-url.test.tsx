import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37/a2ui-catalog-react';
import {reportDocxUrl} from '../../packages/catalog-react/src/renderers/report-docx-url';
import {reportNextUrlItems} from '../../packages/catalog-react/src/renderers/report-next-url-items';

/**
 * DOCX-пункт меню «Скачать» для протокола из выходной полки chat-backend (план
 * files-and-artifacts-layer §3.4, фаза 4): calc-агенты кладут в `protocol.downloadUrl`
 * ссылку `/api/artifacts/<id>/content?format=md`, а `.docx` — тот же путь с `format=docx`.
 * Ссылки на ресурс агента (`/api/agent-resource?…`) работают как раньше.
 */

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

const ARTIFACT_MD = '/api/artifacts/0b6c2f1e-3d4a-4c5b-9e8f-1a2b3c4d5e6f/content?format=md';
const ARTIFACT_DOCX = '/api/artifacts/0b6c2f1e-3d4a-4c5b-9e8f-1a2b3c4d5e6f/content?format=docx';

describe('reportDocxUrl', () => {
  it('артефакт: format=md → format=docx на том же пути', () => {
    expect(reportDocxUrl(ARTIFACT_MD)).toBe(ARTIFACT_DOCX);
  });

  it('префикс перед /api/artifacts сохраняется', () => {
    expect(reportDocxUrl(`/base${ARTIFACT_MD}`)).toBe(`/base${ARTIFACT_DOCX}`);
  });

  it('ресурс агента — по-прежнему конверт-сервис', () => {
    expect(reportDocxUrl('/api/agent-resource?resource=lift-report&taskId=t1')).toBe(
      '/api/agent-resource/convert?format=docx&resource=lift-report&taskId=t1',
    );
  });

  it.each([
    ['другой формат артефакта', '/api/artifacts/a1/content?format=docx'],
    ['окно markdown, не выгрузка', '/api/artifacts/a1/content?offset=0&limit=10'],
    ['лишний параметр после format', '/api/artifacts/a1/content?format=md&x=1'],
    ['бинарный файл артефакта', '/api/artifacts/a1/files/f1'],
    ['вложенный путь в id', '/api/artifacts/a1/b/content?format=md'],
    ['чужой адрес', 'https://elsewhere.example/file.md'],
  ])('чужая форма (%s) — docx-пункта нет', (_case, url) => {
    expect(reportDocxUrl(url)).toBeUndefined();
  });
});

describe('reportNextUrlItems — меню отчётов Next', () => {
  it('артефакт: .md прямой ссылкой, .docx — format=docx', () => {
    expect(reportNextUrlItems(ARTIFACT_MD)).toEqual([
      {label: 'Markdown (.md)', href: ARTIFACT_MD},
      {label: 'Word (.docx)', href: ARTIFACT_DOCX},
    ]);
  });

  it('чужая форма — один пункт .md', () => {
    expect(reportNextUrlItems('https://elsewhere.example/file.md')).toEqual([
      {label: 'Markdown (.md)', href: 'https://elsewhere.example/file.md'},
    ]);
  });
});

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function renderReport(component: string, props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'demo-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'demo-surface',
        components: [{id: 'root', component, ...props}],
      },
    },
  ] as unknown as A2uiMessage[];

  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('demo-surface') as any;
  return render(<A2uiSurface surface={surface} />);
}

function withArtifactUrl(fileName: string) {
  const props = readProps(fileName);
  const protocol = {...(props.protocol as Record<string, unknown>), downloadUrl: ARTIFACT_MD};
  return {...props, protocol};
}

describe('рендер: ссылка на артефакт в downloadUrl', () => {
  it('LiftReport (dropdown <details>): .md и .docx на артефакт', () => {
    const {container} = renderReport('LiftReport', withArtifactUrl('lift-report.json'));

    const items = container.querySelectorAll<HTMLAnchorElement>('.a2ui-dfm__item');
    expect([...items].map(a => a.getAttribute('href'))).toEqual([ARTIFACT_MD, ARTIFACT_DOCX]);
  });

  it('LiftReportNext (меню): .md и .docx на артефакт', async () => {
    renderReport('LiftReportNext', withArtifactUrl('lift-report.json'));

    const trigger = screen.getByRole('button', {name: /^Скачать/});
    await act(async () => {
      trigger.focus();
      fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    });

    const items = screen.getAllByRole('menuitem');
    expect(items.map(item => item.textContent)).toEqual(['Markdown (.md)', 'Word (.docx)']);
    expect(items.map(item => item.getAttribute('href'))).toEqual([ARTIFACT_MD, ARTIFACT_DOCX]);
  });
});
