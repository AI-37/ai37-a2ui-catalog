import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, resolveProposalCardFooter, SurfaceReadOnlyProvider} from '@ai37/a2ui-catalog-react';
import type {ProposalCardProps} from '@ai37/a2ui-catalog-schemas';

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
