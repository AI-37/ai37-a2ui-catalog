import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {
  ArtifactCardHostProvider,
  ai37Catalog,
  artifactDownloadItems,
  safeArtifactsBaseUrl,
  type ArtifactCardHost,
} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';
const ID = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const FILE_ID = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function renderCard(props: Record<string, unknown>, host?: ArtifactCardHost) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 's',
        components: [{id: 'root', component: 'ArtifactCard', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('s') as any;
  const actions: unknown[] = [];
  surface.onAction.subscribe((a: unknown) => actions.push(a));
  const tree = <A2uiSurface surface={surface} />;
  const utils = render(host ? <ArtifactCardHostProvider value={host}>{tree}</ArtifactCardHostProvider> : tree);
  return {actions, ...utils};
}

async function openMenu() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', {name: /Скачать/}));
  });
}

function menuLinks(): Array<[string, string | null]> {
  return screen
    .getAllByRole('menuitem')
    .map(el => [el.textContent ?? '', (el.closest('a') ?? el).getAttribute('href')]);
}

describe('ArtifactCard', () => {
  it('строка: имя и мета; «Скачать» — Word, Markdown и файлы по id', async () => {
    renderCard(readProps('artifact-card.json'));

    expect(screen.getByText('Протокол расчёта лифтов')).toBeTruthy();
    expect(screen.getByText('ГОСТ Р 52941-2008 · Прил. А · 12 шагов')).toBeTruthy();

    await openMenu();
    expect(menuLinks()).toEqual([
      ['Word (.docx)', `/api/artifacts/${ID}/content?format=docx`],
      ['Markdown (.md)', `/api/artifacts/${ID}/content?format=md`],
      ['Исходные данные (.xlsx)', `/api/artifacts/${ID}/files/${FILE_ID}`],
    ]);
  });

  it('без meta мета — summary, без него — kind', () => {
    const {unmount} = renderCard({artifactId: ID, name: 'Док', summary: 'Выжимка', kind: 'pdn'});
    expect(screen.getByText('Выжимка')).toBeTruthy();
    unmount();
    renderCard({artifactId: ID, name: 'Док', kind: 'pdn-policy'});
    expect(screen.getByText('pdn-policy')).toBeTruthy();
  });

  it('formats: [] и нет файлов — меню нет вовсе', () => {
    renderCard({artifactId: ID, name: 'Док', formats: []});
    expect(screen.queryByRole('button', {name: /Скачать/})).toBeNull();
  });

  it('без хоста кнопки «Сохранить в проект» нет', () => {
    renderCard(readProps('artifact-card-minimal.json'));
    expect(screen.queryByRole('button', {name: 'Сохранить в проект'})).toBeNull();
  });

  it('с хостом: сохранение зовёт хост с id, агенту действие не уходит, потом «В проекте»', async () => {
    const onSaveToProject = vi.fn(async () => undefined);
    const {actions} = renderCard(readProps('artifact-card.json'), {onSaveToProject});

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить в проект'}));
    });

    expect(onSaveToProject).toHaveBeenCalledWith(ID);
    expect(actions).toEqual([]);
    expect(screen.getByText('В проекте')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Сохранить в проект'})).toBeNull();
  });

  it('отказ хоста — «Не удалось сохранить», кнопка остаётся', async () => {
    const onSaveToProject = vi.fn(async () => {
      throw new Error('403');
    });
    renderCard(readProps('artifact-card.json'), {onSaveToProject});

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Сохранить в проект'}));
    });

    expect(screen.getByRole('status').textContent).toBe('Не удалось сохранить');
    expect(screen.getByRole('button', {name: 'Сохранить в проект'})).toBeTruthy();
  });

  it('scope=project — уже в проекте, кнопки нет даже с хостом', () => {
    renderCard({artifactId: ID, name: 'Док', scope: 'project'}, {onSaveToProject: vi.fn()});
    expect(screen.getByText('В проекте')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Сохранить в проект'})).toBeNull();
  });

  it('база ссылок хоста подставляется, если это путь от корня', async () => {
    renderCard({artifactId: ID, name: 'Док', formats: ['md']}, {baseUrl: '/bff/artifacts/'});
    await openMenu();
    expect(menuLinks()).toEqual([['Markdown (.md)', `/bff/artifacts/${ID}/content?format=md`]]);
  });
});

describe('safeArtifactsBaseUrl — отказ от небезопасной базы', () => {
  it.each([
    'https://evil.example/api',
    '//evil.example/api',
    'javascript:alert(1)',
    'api/artifacts',
    '/a\\b',
    '/a/../admin',
    '/a\nb',
  ])('%j → /api/artifacts', base => {
    expect(safeArtifactsBaseUrl(base)).toBe('/api/artifacts');
  });

  it('путь от корня берётся без хвостового слеша; нет базы — дефолт', () => {
    expect(safeArtifactsBaseUrl('/bff/artifacts/')).toBe('/bff/artifacts');
    expect(safeArtifactsBaseUrl(undefined)).toBe('/api/artifacts');
  });

  it('id в ссылках экранируются, даже если до рендера дошло что-то мимо схемы', () => {
    const items = artifactDownloadItems(
      {artifactId: '../x', name: 'n', formats: ['md'], files: [{id: 'a/b', fileName: 'f'}]},
      '/api/artifacts',
    );
    expect(items.map(i => i.href)).toEqual([
      '/api/artifacts/..%2Fx/content?format=md',
      '/api/artifacts/..%2Fx/files/a%2Fb',
    ]);
  });
});
