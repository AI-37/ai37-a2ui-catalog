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
  type ArtifactCardHost,
} from '@ai37/a2ui-catalog-react';
import {reportArtifactId} from '../../packages/catalog-react/src/renderers/report-artifact-id';

/**
 * «Сохранить в проект» в меню «Скачать» отчётов расчётов (план files-and-artifacts-layer
 * §3.4, фаза 4): пункт есть, только когда `protocol.downloadUrl` ведёт на артефакт выходной
 * полки и хост дал `onSaveToProject` через тот же `ArtifactCardHostProvider`, что у
 * `ArtifactCard`.
 */

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';
const ID = '0b6c2f1e-3d4a-4c5b-9e8f-1a2b3c4d5e6f';
const ARTIFACT_MD = `/api/artifacts/${ID}/content?format=md`;
const AGENT_RESOURCE = '/api/agent-resource?resource=lift-report&taskId=t1';

describe('reportArtifactId', () => {
  it.each([
    ['content?format=md', ARTIFACT_MD],
    ['файл артефакта', `/api/artifacts/${ID}/files/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d`],
    ['префикс BFF', `/bff/api/artifacts/${ID}/content?format=md`],
    ['абсолютный адрес', `https://sp-ai.ru/api/artifacts/${ID}/content?format=md`],
    ['метаданные без хвоста', `/api/artifacts/${ID}`],
  ])('%s → uuid', (_case, url) => {
    expect(reportArtifactId(url)).toBe(ID);
  });

  it('uuid в верхнем регистре приводится к нижнему', () => {
    expect(reportArtifactId(`/api/artifacts/${ID.toUpperCase()}/content?format=md`)).toBe(ID);
  });

  it.each([
    ['ресурс агента', AGENT_RESOURCE],
    ['не uuid', '/api/artifacts/a1/content?format=md'],
    ['uuid с хвостом в том же сегменте', `/api/artifacts/${ID}x/content?format=md`],
    ['обход пути', `/api/artifacts/../${ID}/content`],
    ['артефакт только в query', `/api/agent-resource?next=/api/artifacts/${ID}/content`],
    ['артефакт только во фрагменте', `/file.md#/api/artifacts/${ID}/content`],
    ['чужой путь', `/api/projects/${ID}/files`],
  ])('%s → undefined', (_case, url) => {
    expect(reportArtifactId(url)).toBeUndefined();
  });
});

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function withDownloadUrl(fileName: string, downloadUrl: string) {
  const props = readProps(fileName);
  return {...props, protocol: {...(props.protocol as Record<string, unknown>), downloadUrl}};
}

function renderReport(component: string, props: Record<string, unknown>, host?: ArtifactCardHost) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {surfaceId: 's', components: [{id: 'root', component, ...props}]},
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('s') as any;
  const actions: unknown[] = [];
  surface.onAction.subscribe((a: unknown) => actions.push(a));
  const tree = <A2uiSurface surface={surface} />;
  const utils = render(
    host ? <ArtifactCardHostProvider value={host}>{tree}</ArtifactCardHostProvider> : tree,
  );
  return {actions, ...utils};
}

async function openNextMenu() {
  const trigger = screen.getByRole('button', {name: /^Скачать/});
  await act(async () => {
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
}

function menuLabels(): string[] {
  return screen.getAllByRole('menuitem').map(item => item.textContent ?? '');
}

const NEXT_REPORTS: Array<[string, string]> = [
  ['LiftReportNext', 'lift-report.json'],
  ['ThermalReportNext', 'thermal-report-single.json'],
  ['KeoReportNext', 'keo-report-drawings.json'],
];

describe('меню Next-отчётов: пункт «Сохранить в проект»', () => {
  it.each(NEXT_REPORTS)('%s: артефакт + хост — пункт последним', async (component, fixture) => {
    renderReport(component, withDownloadUrl(fixture, ARTIFACT_MD), {
      onSaveToProject: vi.fn(async () => undefined),
    });
    await openNextMenu();
    expect(menuLabels()).toEqual(['Markdown (.md)', 'Word (.docx)', 'Сохранить в проект']);
  });

  it.each(NEXT_REPORTS)('%s: артефакт без провайдера — пункта нет', async (component, fixture) => {
    renderReport(component, withDownloadUrl(fixture, ARTIFACT_MD));
    await openNextMenu();
    expect(menuLabels()).toEqual(['Markdown (.md)', 'Word (.docx)']);
  });

  it('провайдер без onSaveToProject (widget-канал, тред вне проекта) — пункта нет', async () => {
    renderReport('LiftReportNext', withDownloadUrl('lift-report.json', ARTIFACT_MD), {
      baseUrl: '/api/artifacts',
    });
    await openNextMenu();
    expect(menuLabels()).toEqual(['Markdown (.md)', 'Word (.docx)']);
  });

  it('ресурс агента при хосте — пункта нет, сохранять нечего', async () => {
    const onSaveToProject = vi.fn(async () => undefined);
    renderReport('LiftReportNext', withDownloadUrl('lift-report.json', AGENT_RESOURCE), {
      onSaveToProject,
    });
    await openNextMenu();
    expect(menuLabels()).toEqual(['Markdown (.md)', 'Word (.docx)']);
    expect(onSaveToProject).not.toHaveBeenCalled();
  });

  it('успех: хост получает uuid из URL, агенту ничего не уходит, пункт — «В проекте»', async () => {
    const onSaveToProject = vi.fn(async () => undefined);
    const {actions} = renderReport(
      'LiftReportNext',
      withDownloadUrl('lift-report.json', ARTIFACT_MD),
      {onSaveToProject},
    );

    await openNextMenu();
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });

    expect(onSaveToProject).toHaveBeenCalledExactlyOnceWith(ID);
    expect(actions).toEqual([]);

    await openNextMenu();
    const saved = screen.getByRole('menuitem', {name: 'В проекте'});
    expect(saved.getAttribute('aria-disabled')).toBe('true');
    await act(async () => {
      fireEvent.click(saved);
    });
    expect(onSaveToProject).toHaveBeenCalledTimes(1);
  });

  it('отказ хоста: пункт предлагает ещё раз, повтор снова зовёт хост', async () => {
    const onSaveToProject = vi
      .fn<(id: string) => Promise<void>>()
      .mockRejectedValueOnce(new Error('403'))
      .mockResolvedValueOnce(undefined);
    renderReport('ThermalReportNext', withDownloadUrl('thermal-report-single.json', ARTIFACT_MD), {
      onSaveToProject,
    });

    await openNextMenu();
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });
    await openNextMenu();
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Не удалось сохранить, ещё раз'}));
    });

    expect(onSaveToProject).toHaveBeenCalledTimes(2);
    await openNextMenu();
    expect(screen.getByRole('menuitem', {name: 'В проекте'})).toBeTruthy();
  });

  it('пока идёт сохранение — «Сохраняю…», неактивно', async () => {
    let resolve: () => void = () => undefined;
    const onSaveToProject = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );
    renderReport('KeoReportNext', withDownloadUrl('keo-report-drawings.json', ARTIFACT_MD), {
      onSaveToProject,
    });

    await openNextMenu();
    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });
    await openNextMenu();
    const saving = screen.getByRole('menuitem', {name: 'Сохраняю…'});
    expect(saving.getAttribute('aria-disabled')).toBe('true');

    await act(async () => {
      resolve();
    });
    expect(screen.getByRole('menuitem', {name: 'В проекте'})).toBeTruthy();
  });
});

describe('dropdown <details> (LiftReport, ThermalReport): пункт «Сохранить в проект»', () => {
  const LEGACY: Array<[string, string]> = [
    ['LiftReport', 'lift-report.json'],
    ['ThermalReport', 'thermal-report-single.json'],
  ];

  function dfmLabels(container: HTMLElement): string[] {
    return [...container.querySelectorAll('.a2ui-dfm__item')].map(el => el.textContent ?? '');
  }

  it.each(LEGACY)('%s: артефакт + хост — кнопка-пункт', (component, fixture) => {
    const {container} = renderReport(component, withDownloadUrl(fixture, ARTIFACT_MD), {
      onSaveToProject: vi.fn(async () => undefined),
    });
    expect(dfmLabels(container)).toEqual(['Markdown (.md)', 'Word (.docx)', 'Сохранить в проект']);
  });

  it.each(LEGACY)('%s: без провайдера — пункта нет', (component, fixture) => {
    const {container} = renderReport(component, withDownloadUrl(fixture, ARTIFACT_MD));
    expect(dfmLabels(container)).toEqual(['Markdown (.md)', 'Word (.docx)']);
  });

  it('ресурс агента при хосте — пункта нет', () => {
    const props = withDownloadUrl('lift-report.json', AGENT_RESOURCE);
    const {container} = renderReport('LiftReport', props, {
      onSaveToProject: vi.fn(async () => undefined),
    });
    expect(dfmLabels(container)).toEqual(['Markdown (.md)', 'Word (.docx)']);
  });

  it('успех: хост получает uuid, кнопка — неактивное «В проекте»', async () => {
    const onSaveToProject = vi.fn(async () => undefined);
    const props = withDownloadUrl('thermal-report-single.json', ARTIFACT_MD);
    const {actions} = renderReport('ThermalReport', props, {onSaveToProject});

    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });

    expect(onSaveToProject).toHaveBeenCalledExactlyOnceWith(ID);
    expect(actions).toEqual([]);
    const saved = screen.getByRole('menuitem', {name: 'В проекте'}) as HTMLButtonElement;
    expect(saved.disabled).toBe(true);
  });

  it('отказ хоста — «Не удалось сохранить, ещё раз», кнопка активна', async () => {
    const onSaveToProject = vi.fn(async () => {
      throw new Error('403');
    });
    renderReport('LiftReport', withDownloadUrl('lift-report.json', ARTIFACT_MD), {onSaveToProject});

    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });

    const retry = screen.getByRole('menuitem', {
      name: 'Не удалось сохранить, ещё раз',
    }) as HTMLButtonElement;
    expect(retry.disabled).toBe(false);
  });
});
