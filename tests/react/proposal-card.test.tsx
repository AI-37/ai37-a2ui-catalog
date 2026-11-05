import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, resolveProposalCardFooter, SurfaceReadOnlyProvider} from '@ai37/a2ui-catalog-react';
import type {ProposalCardProps, ProposalItem} from '@ai37/a2ui-catalog-schemas';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(name: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', name), 'utf8'),
  ).props as ProposalCardProps;
}

function renderCard(props: ProposalCardProps, readOnly?: boolean) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 'cabinet-surface', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'cabinet-surface',
        components: [{id: 'root', component: 'ProposalCard', ...props}],
      },
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  const surface = processor.model.getSurface('cabinet-surface') as any;
  const actions: unknown[] = [];
  surface.onAction.subscribe((action: unknown) => actions.push(action));

  const tree = <A2uiSurface surface={surface} />;
  const view = render(
    readOnly === undefined ? tree : <SurfaceReadOnlyProvider readOnly={readOnly}>{tree}</SurfaceReadOnlyProvider>,
  );
  return {...view, actions};
}

const voice = () => readProps('proposal-card-voice.json');
const params = () => readProps('proposal-card-params.json');
const documents = () => readProps('proposal-card-documents.json');
const confirmButton = () => screen.queryByRole('button', {name: 'Подтвердить'});
const decideLink = () => screen.queryByRole('link', {name: 'Решить в «Требуют решения»'});

describe('ProposalCard', () => {
  it('рисует заголовок, состояние, пункты списком, цитату и заметку', () => {
    renderCard(voice());
    expect(screen.getByText('Изменения из голосового сообщения')).toBeTruthy();
    expect(screen.getByText('ждёт подтверждения')).toBeTruthy();

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]!.textContent).toBe('новоеузел: камера охлаждения зерна (система, круглый год)');
    expect(items[2]!.textContent).toBe('измененовытяжка ростеров: 1 → 2');

    expect(screen.getByText(/Вытяжек над ростерами две/).closest('blockquote')).toBeTruthy();
    expect(screen.getByText('Голосовое сообщение · 0:21').tagName).toBe('FIGCAPTION');
    expect(screen.getByText(/Подтвердить может владелец или редактор/)).toBeTruthy();
  });

  it('«Подтвердить» шлёт action с proposalId и гаснет; повторного действия нет', async () => {
    const {actions} = renderCard(voice());
    expect(decideLink()).toBeNull();

    await act(async () => fireEvent.click(confirmButton()!));
    await act(async () => fireEvent.click(confirmButton()!));

    expect(actions).toHaveLength(1);
    const sent = actions[0] as {name: string; surfaceId: string; context: Record<string, unknown>};
    expect(sent.name).toBe('proposal.accept');
    expect(sent.surfaceId).toBe('cabinet-surface');
    expect(sent.context).toEqual({proposalId: 'pb_7f3a2c', decision: 'accept'});
    expect((confirmButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it('на прошлой поверхности кнопки нет, ссылка на «Требуют решения» рабочая', () => {
    const {container} = renderCard(voice(), true);
    expect(confirmButton()).toBeNull();
    expect(decideLink()!.getAttribute('href')).toBe('/cabinet/decisions?proposal=pb_7f3a2c');
    expect(container.querySelector('[inert]')).toBeNull();
  });

  it('без живой задачи (нет confirm) — ссылка вместо кнопки, таблица с датой и статусом пункта', () => {
    renderCard(params());
    expect(confirmButton()).toBeNull();
    expect(decideLink()).toBeTruthy();

    const table = screen.getByRole('table');
    const headers = within(table).getAllByRole('columnheader').map(cell => cell.textContent);
    expect(headers).toEqual(['Что', 'Было', 'Станет', 'С какой даты']);
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map(row => within(row).getAllByRole('cell').map(cell => cell.textContent))).toEqual([
      ['Тариф электроэнергии, ₽/кВт·ч', '7,12', '7,48', '01.11.2026'],
      ['Ночной тариф, ₽/кВт·ч', '—', '3,90', '01.11.2026'],
      ['Тариф выходного дняустарело', '6,80', 'удалено', '—'],
    ]);
  });

  it('canDecide: false — ни кнопки, ни ссылки', () => {
    renderCard({...voice(), canDecide: false});
    expect(confirmButton()).toBeNull();
    expect(decideLink()).toBeNull();
  });

  it('заменённая пачка — «заменено», без кнопки и приглушена', () => {
    const {container} = renderCard({...voice(), state: 'superseded'});
    expect(screen.getByText('заменено')).toBeTruthy();
    expect(confirmButton()).toBeNull();
    expect(decideLink()).toBeNull();
    expect(container.querySelector('ul')!.closest('.a2ui-t--muted')).toBeTruthy();
  });

  it('решённая пачка показывает итог и статусы пунктов', () => {
    const props = voice();
    renderCard({
      ...props,
      state: 'accepted',
      items: props.items.map((item, index) => ({...item, status: index === 0 ? 'rejected' : 'accepted'})),
    });
    expect(screen.getByText('подтверждено')).toBeTruthy();
    expect(screen.getAllByText('принято')).toHaveLength(3);
    expect(screen.getByText('отклонено')).toBeTruthy();
    expect(confirmButton()).toBeNull();
  });
});

describe('ProposalCard — источник пункта', () => {
  const withSource = (source: ProposalItem['source']): ProposalCardProps => {
    const props = voice();
    return {...props, items: props.items.map((item, index) => (index === 2 ? {...item, source} : item))};
  };

  it('таблица: под «Что» подпись документа, цитата в кавычках, ссылка только с href', () => {
    renderCard(documents());
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    const what = rows.map(row => within(row).getAllByRole('cell')[0]!);

    const link = within(what[0]!).getByRole('link', {name: 'Акт техприсоединения.pdf, стр. 2'});
    expect(link.getAttribute('href')).toBe('/projects/prj_demo/documents');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(within(what[0]!).getByText('«Максимальная мощность энергопринимающих устройств — 450 кВт.»')).toBeTruthy();

    expect(within(what[1]!).queryByRole('link')).toBeNull();
    expect(what[1]!.textContent).toBe(
      'Тариф электроэнергии, ₽/кВт·чСчёт за сентябрь.pdf, стр. 2«Цена за 1 кВт·ч — 7,48 руб. без НДС.»',
    );
    expect(what[2]!.textContent).toBe(
      'Площадь производственного цеха, м²Техпаспорт здания.xlsx, лист «Экспликация», D14',
    );
    expect(within(what[2]!).queryByText(/^«/)).toBeNull();
  });

  it('список: источник под текстом пункта приглушённой строкой, у остальных пунктов его нет', () => {
    renderCard(withSource({label: 'Паспорт вытяжки.pdf, стр. 3', quote: 'Две вытяжки над ростерами'}));
    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items[2]!.textContent).toBe(
      'измененовытяжка ростеров: 1 → 2Паспорт вытяжки.pdf, стр. 3«Две вытяжки над ростерами»',
    );
    expect(within(items[2]!).getByText('Паспорт вытяжки.pdf, стр. 3').closest('.a2ui-t--muted')).toBeTruthy();
    expect(items[0]!.textContent).toBe('новоеузел: камера охлаждения зерна (система, круглый год)');
  });

  it('только цитата — без подписи и ссылки', () => {
    renderCard(withSource({quote: 'Две вытяжки', href: '/projects/p/documents'}));
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items[2]!.textContent).toBe('измененовытяжка ростеров: 1 → 2«Две вытяжки»');
    expect(within(items[2]!).queryByRole('link')).toBeNull();
  });

  it.each(['project-attachment:ser_1#p2', 'javascript:alert(1)', '//evil.example/x', 'documents/ser_1'])(
    'служебный или небезопасный href %s — подпись текстом, не ссылкой',
    href => {
      renderCard(withSource({label: 'Счёт.pdf, стр. 2', href}));
      expect(screen.getByText('Счёт.pdf, стр. 2').closest('a')).toBeNull();
    },
  );

  it('источник пачки: подпись ссылкой при href, без цитаты — без blockquote', () => {
    const {container} = renderCard({...voice(), source: {label: 'Документация проекта', href: 'https://docs.example/p'}});
    const link = screen.getByRole('link', {name: 'Документация проекта'});
    expect(link.closest('figcaption')).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://docs.example/p');
    expect(container.querySelector('blockquote')).toBeNull();
  });
});

describe('ProposalCard — ссылки источника', () => {
  const voiceLinks = () => readProps('proposal-card-voice-links.json');
  const caption = (container: HTMLElement) => container.querySelector('figcaption')!;

  it('после подписи: запись с href — ссылка в новой вкладке, без href — подпись', () => {
    const {container} = renderCard(voiceLinks());
    const figcaption = caption(container);

    expect(figcaption.textContent).toBe(
      'Голосовые сообщения · 2Голосовое сообщение 1Голосовое сообщение 2 — запись удалена',
    );
    const link = within(figcaption).getByRole('link', {name: 'Голосовое сообщение 1'});
    expect(link.getAttribute('href')).toBe('https://docs.polimetrika.example/documents/ser_4b7d21');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(within(figcaption).getAllByRole('link')).toHaveLength(1);
    expect(within(figcaption).getByText('Голосовое сообщение 2 — запись удалена').tagName).toBe('SPAN');
    expect(container.querySelector('blockquote')!.textContent).toBe(
      'Уставку приточки теперь держим двадцать, а цех с понедельника работает с семи до девяти.',
    );
  });

  it('разметка источника со ссылками', () => {
    const {container} = renderCard(voiceLinks());
    expect(container.querySelector('figure')!.outerHTML).toMatchSnapshot();
  });

  it('служебный href у записи — подпись, не ссылка', () => {
    const props = voiceLinks();
    const source = {...props.source!, links: [{label: 'Голосовое сообщение 1', href: 'project-attachment:ser_1'}]};
    const {container} = renderCard({...props, source});
    expect(within(caption(container)).queryByRole('link')).toBeNull();
    expect(caption(container).textContent).toBe('Голосовые сообщения · 2Голосовое сообщение 1');
  });

  it('пустой список и отсутствие поля рисуют то же, что 0.44.0', () => {
    const empty = renderCard({...voice(), source: {...voice().source!, links: []}});
    const emptyHtml = empty.container.querySelector('figure')!.outerHTML;
    empty.unmount();
    const absent = renderCard(voice());
    expect(absent.container.querySelector('figure')!.outerHTML).toBe(emptyHtml);
  });

  it('источник с цитатой и ссылками, без подписи — ссылки в подписи под цитатой', () => {
    const source = {quote: 'Две вытяжки', links: [{label: 'Голосовое сообщение 1'}]};
    const {container} = renderCard({...voice(), source});
    expect(caption(container).textContent).toBe('Голосовое сообщение 1');
  });

  it('у источника пункта ссылки идут после цитаты', () => {
    const props = voice();
    const links = [{label: 'Приложение 1', href: '/documents/ser_2'}];
    const source = {label: 'Акт.pdf, стр. 2', quote: '450 кВт', links};
    renderCard({...props, items: props.items.map((item, index) => (index === 2 ? {...item, source} : item))});
    const item = within(screen.getByRole('list')).getAllByRole('listitem')[2]!;
    expect(item.textContent).toBe('измененовытяжка ростеров: 1 → 2Акт.pdf, стр. 2«450 кВт»Приложение 1');
    expect(within(item).getByRole('link', {name: 'Приложение 1'}).getAttribute('href')).toBe('/documents/ser_2');
  });
});

describe('resolveProposalCardFooter', () => {
  const base: ProposalCardProps = {
    proposalId: 'pb_1',
    title: 'Изменения',
    state: 'open',
    items: [{id: 'a', kind: 'added', label: 'узел'}],
    confirm: {label: 'Подтвердить', action: 'accept'},
    decideLink: {label: 'Решить', href: '/cabinet/decisions'},
  };

  it('кнопка на живой поверхности, ссылка на прошлой', () => {
    expect(resolveProposalCardFooter(base, false)).toBe('confirm');
    expect(resolveProposalCardFooter(base, true)).toBe('link');
  });

  it('решённая пачка и зритель без права — пусто', () => {
    for (const state of ['accepted', 'rejected', 'superseded'] as const) {
      expect(resolveProposalCardFooter({...base, state}, false)).toBe('none');
    }
    expect(resolveProposalCardFooter({...base, canDecide: false}, false)).toBe('none');
  });

  it('небезопасный адрес ссылки не показывается', () => {
    const {confirm: _confirm, ...withoutConfirm} = base;
    for (const href of ['javascript:alert(1)', '//evil.example/x', 'cabinet/decisions']) {
      expect(resolveProposalCardFooter({...withoutConfirm, decideLink: {label: 'x', href}}, false)).toBe(
        'none',
      );
    }
    expect(
      resolveProposalCardFooter({...withoutConfirm, decideLink: {label: 'x', href: 'https://app/x'}}, false),
    ).toBe('link');
  });
});
