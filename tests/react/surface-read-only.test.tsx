import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {
  ArtifactCardHostProvider,
  SurfaceReadOnlyProvider,
  ai37Catalog,
  useSurfaceReadOnly,
  type ArtifactCardHost,
} from '@ai37/a2ui-catalog-react';

/**
 * Режим «только чтение» прошлой поверхности: ввод (формы, редакторы, кнопки действий
 * отчёта) глушится, а скачивание, «Сохранить в проект», ссылки и раскрытие — нет.
 */

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';
const ARTIFACT_ID = '0b6c2f1e-3d4a-4c5b-9e8f-1a2b3c4d5e6f';
const ARTIFACT_MD = `/api/artifacts/${ARTIFACT_ID}/content?format=md`;

const FOCUSABLE = 'input, select, textarea, button, summary, a[href], [tabindex]';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

function withDownloadUrl(fileName: string, downloadUrl: string) {
  const props = readProps(fileName);
  return {...props, protocol: {...(props.protocol as Record<string, unknown>), downloadUrl}};
}

type Components = Array<Record<string, unknown>>;

function createSurface(components: Components) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: CATALOG_ID}},
    {version: 'v0.9', updateComponents: {surfaceId: 's', components}},
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('s') as any;
  const actions: unknown[] = [];
  surface.onAction.subscribe((a: unknown) => actions.push(a));
  return {surface, actions};
}

function tree(surface: unknown, readOnly: boolean | undefined, host?: ArtifactCardHost) {
  const node = <A2uiSurface surface={surface as any} />;
  const gated =
    readOnly === undefined ? (
      node
    ) : (
      <SurfaceReadOnlyProvider readOnly={readOnly}>{node}</SurfaceReadOnlyProvider>
    );
  return host ? <ArtifactCardHostProvider value={host}>{gated}</ArtifactCardHostProvider> : gated;
}

function renderRoot(
  component: string,
  props: Record<string, unknown>,
  readOnly: boolean | undefined,
  host?: ArtifactCardHost,
) {
  const {surface, actions} = createSurface([{id: 'root', component, ...props}]);
  const utils = render(tree(surface, readOnly, host));
  const rerenderMode = (next: boolean) => utils.rerender(tree(surface, next, host));
  return {actions, rerenderMode, ...utils};
}

function focusables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
}

function insideInert(el: Element): boolean {
  return el.closest('[inert]') !== null;
}

const INPUT_SURFACES: Array<[string, string]> = [
  ['FormCard', 'form-card.json'],
  ['ChoiceCard', 'choice-card.json'],
  ['ConstructionsEditor', 'constructions-editor.json'],
  ['ConstructionsEditorNext', 'constructions-editor.json'],
  ['LiftEditor', 'lift-editor-per-lift.json'],
  ['LiftEditorNext', 'lift-editor-per-lift.json'],
  ['KeoEditor', 'keo-editor.json'],
  ['KeoEditorNext', 'keo-editor.json'],
  ['InsolationEditor', 'insolation-editor.json'],
];

describe('компоненты ввода на прошлой поверхности', () => {
  it.each(INPUT_SURFACES)('%s: весь интерактив внутри inert', (component, fixture) => {
    const {container} = renderRoot(component, readProps(fixture), true);
    const controls = focusables(container);
    expect(controls.length).toBeGreaterThan(0);
    expect(controls.filter(el => !insideInert(el))).toEqual([]);
    expect(container.querySelector('[data-a2ui-read-only]')).not.toBeNull();
  });

  it.each(INPUT_SURFACES)('%s: на живой поверхности inert нет', (component, fixture) => {
    const {container} = renderRoot(component, readProps(fixture), false);
    expect(focusables(container).some(insideInert)).toBe(false);
    expect(container.querySelector('[data-a2ui-read-only]')).toBeNull();
  });

  it('без провайдера обёртки нет вовсе — рендер как раньше', () => {
    const {container} = renderRoot('FormCard', readProps('form-card.json'), undefined);
    expect(container.querySelector('[data-a2ui-read-only]')).toBeNull();
    expect(container.querySelector('div[style*="contents"]')).toBeNull();
  });

  it('базовые Button и TextField тоже глушатся', () => {
    const {surface} = createSurface([
      {id: 'root', component: 'Column', children: ['field', 'btn']},
      {id: 'field', component: 'TextField', label: 'Имя', value: 'x'},
      {id: 'btn', component: 'Button', child: 'btn-text', action: {event: {name: 'go'}}},
      {id: 'btn-text', component: 'Text', text: 'Отправить'},
    ]);
    const {container} = render(tree(surface, true));
    const controls = focusables(container);
    expect(controls.length).toBeGreaterThanOrEqual(2);
    expect(controls.filter(el => !insideInert(el))).toEqual([]);
  });

  it('переход «живая → прошлая» не перемонтирует форму: введённое остаётся', () => {
    const props = readProps('form-card.json');
    const {container, rerenderMode, actions} = renderRoot('FormCard', props, false);
    const input = container.querySelector<HTMLInputElement>('input[name="building_name"]')!;
    fireEvent.change(input, {target: {value: 'введено до перехода'}});

    rerenderMode(true);

    const after = container.querySelector<HTMLInputElement>('input[name="building_name"]')!;
    expect(after).toBe(input);
    expect(after.value).toBe('введено до перехода');
    expect(insideInert(after)).toBe(true);
    expect(actions).toEqual([]);
  });

  it('живая форма отправляет действие как раньше', async () => {
    const {container, actions} = renderRoot('FormCard', readProps('form-card.json'), false);
    // onAction.emit асинхронный: ждём эмита внутри act.
    await act(async () => {
      fireEvent.submit(container.querySelector('form')!);
    });
    expect(actions).toHaveLength(1);
  });
});

describe('useSurfaceReadOnly', () => {
  function Probe() {
    return <span>{String(useSurfaceReadOnly())}</span>;
  }

  it('без провайдера — false, под провайдером — его значение', () => {
    const {rerender} = render(<Probe />);
    expect(screen.getByText('false')).toBeTruthy();
    rerender(
      <SurfaceReadOnlyProvider readOnly>
        <Probe />
      </SurfaceReadOnlyProvider>,
    );
    expect(screen.getByText('true')).toBeTruthy();
  });
});

const NEXT_REPORTS: Array<[string, string]> = [
  ['LiftReportNext', 'lift-report.json'],
  ['ThermalReportNext', 'thermal-report-single.json'],
  ['KeoReportNext', 'keo-report-drawings.json'],
];

const LEGACY_REPORTS: Array<[string, string]> = [
  ['LiftReport', 'lift-report.json'],
  ['ThermalReport', 'thermal-report-single.json'],
  ['KeoReport', 'keo-report-fail.json'],
  ['InsolationReport', 'insolation-report-fail.json'],
];

async function openNextMenu() {
  const trigger = screen.getByRole('button', {name: /^Скачать/});
  await act(async () => {
    trigger.focus();
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
}

describe('отчёты на прошлой поверхности', () => {
  it.each(NEXT_REPORTS)('%s: кнопок действий агенту нет, на живой — есть', (component, fixture) => {
    const props = readProps(fixture);
    const live = renderRoot(component, props, false);
    const liveButtons = live.container.querySelectorAll('button').length;
    live.unmount();

    const past = renderRoot(component, props, true);
    const pastButtons = past.container.querySelectorAll('button').length;
    expect(pastButtons).toBeLessThan(liveButtons);
    expect(focusables(past.container).some(insideInert)).toBe(false);
  });

  it.each(NEXT_REPORTS)(
    '%s: «Скачать» и «Сохранить в проект» работают, агенту ничего не уходит',
    async (component, fixture) => {
      const onSaveToProject = vi.fn(async () => undefined);
      const {actions} = renderRoot(component, withDownloadUrl(fixture, ARTIFACT_MD), true, {
        onSaveToProject,
      });

      await openNextMenu();
      const md = screen.getByRole('menuitem', {name: 'Markdown (.md)'});
      expect(md.getAttribute('href')).toBe(ARTIFACT_MD);
      expect(insideInert(md)).toBe(false);

      await act(async () => {
        fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
      });
      expect(onSaveToProject).toHaveBeenCalledExactlyOnceWith(ARTIFACT_ID);
      expect(actions).toEqual([]);
    },
  );

  it.each(LEGACY_REPORTS)('%s: кнопок с data-action нет, на живой — есть', (component, fixture) => {
    const props = readProps(fixture);
    const live = renderRoot(component, props, false);
    expect(live.container.querySelectorAll('[data-action]').length).toBeGreaterThan(0);
    live.unmount();

    const past = renderRoot(component, props, true);
    expect(past.container.querySelectorAll('[data-action]')).toHaveLength(0);
    expect(focusables(past.container).some(insideInert)).toBe(false);
  });

  it('LiftReport: dropdown «Скачать» на <details> — ссылки и «Сохранить в проект» активны', async () => {
    const onSaveToProject = vi.fn(async () => undefined);
    const {container, actions} = renderRoot(
      'LiftReport',
      withDownloadUrl('lift-report.json', ARTIFACT_MD),
      true,
      {onSaveToProject},
    );

    const summary = container.querySelector('.a2ui-dfm summary')!;
    expect(insideInert(summary)).toBe(false);
    const links = [...container.querySelectorAll<HTMLAnchorElement>('.a2ui-dfm a[href]')];
    expect(links.map(a => a.getAttribute('href'))).toContain(ARTIFACT_MD);

    await act(async () => {
      fireEvent.click(screen.getByRole('menuitem', {name: 'Сохранить в проект'}));
    });
    expect(onSaveToProject).toHaveBeenCalledExactlyOnceWith(ARTIFACT_ID);
    expect(actions).toEqual([]);
  });
});

describe('не-ввод не оборачивается', () => {
  it('ArtifactCard на прошлой поверхности: ссылки и «Сохранить в проект» вне inert', () => {
    const {container} = renderRoot('ArtifactCard', readProps('artifact-card.json'), true, {
      onSaveToProject: vi.fn(async () => undefined),
    });
    expect(container.querySelector('[data-a2ui-read-only]')).toBeNull();
    expect(focusables(container).length).toBeGreaterThan(0);
    expect(focusables(container).some(insideInert)).toBe(false);
  });

  it('SimpleTable на прошлой поверхности без обёртки', () => {
    const {container} = renderRoot('SimpleTable', readProps('simple-table.json'), true);
    expect(container.querySelector('[data-a2ui-read-only]')).toBeNull();
  });
});
