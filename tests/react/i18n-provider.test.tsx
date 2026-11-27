import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {
  A2uiI18nProvider,
  ai37Catalog,
  createA2uiI18n,
  resolveA2uiLocale,
  useA2uiI18n,
  type A2uiMessagesOverride,
} from '@ai37/a2ui-catalog-react';

const CATALOG_ID =
  'https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json';

function readProps(fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', fileName), 'utf8'),
  ).props as Record<string, unknown>;
}

/** Поверхность с одной карточкой каталога — так провайдер проверяется сквозь a2ui-хост. */
function surface(component: string, props: Record<string, unknown>) {
  const messages = [
    {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: CATALOG_ID}},
    {
      version: 'v0.9',
      updateComponents: {surfaceId: 's', components: [{id: 'root', component, ...props}]},
    },
  ] as unknown as A2uiMessage[];
  const processor = new MessageProcessor([ai37Catalog]);
  processor.processMessages(messages);
  return <A2uiSurface surface={processor.model.getSurface('s') as never} />;
}

function renderProposal(provider?: {locale: string; messages?: A2uiMessagesOverride}) {
  const tree = surface('ProposalCard', readProps('proposal-card-params.json'));
  return render(provider ? <A2uiI18nProvider {...provider}>{tree}</A2uiI18nProvider> : tree);
}

function LocaleProbe() {
  const {locale, messages} = useA2uiI18n();
  return <span data-testid="probe">{`${locale}|${messages.common.show}`}</span>;
}

describe('A2uiI18nProvider', () => {
  it('без провайдера каталог говорит по-русски, как раньше', () => {
    renderProposal();

    expect(screen.getByText('ждёт подтверждения')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Было'})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'С какой даты'})).toBeInTheDocument();
  });

  it('es — подписи рендерера по-испански, тексты агента как пришли', () => {
    renderProposal({locale: 'es'});

    expect(screen.getByText('pendiente de confirmación')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Antes'})).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Desde qué fecha'})).toBeInTheDocument();
    expect(screen.queryByText('ждёт подтверждения')).toBeNull();
    // Заголовок прислал агент — его переводит агент, не каталог.
    expect(screen.getByText('Параметры объекта из файла «Тарифы 2026.xlsx»')).toBeInTheDocument();
  });

  it('es-MX берёт словарь es, а тег для форматтеров не обрезается', () => {
    render(
      <A2uiI18nProvider locale="es-MX">
        <LocaleProbe />
      </A2uiI18nProvider>,
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('es-MX|Mostrar');
  });

  it('язык без словаря (pl) уходит в en целиком', () => {
    renderProposal({locale: 'pl'});

    expect(screen.getByText('awaiting confirmation')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Was'})).toBeInTheDocument();
  });

  it('переводы хоста перекрывают встроенные по ключам, остальное — из словаря', () => {
    renderProposal({
      locale: 'es',
      messages: {proposal: {stateOpen: 'por confirmar'}},
    });

    expect(screen.getByText('por confirmar')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: 'Antes'})).toBeInTheDocument();
  });

  it('большие экраны тоже на словаре: конструкции, отчёт КЕО, проверка контрагента', () => {
    const fixture = (name: string) =>
      JSON.parse(fs.readFileSync(path.join(process.cwd(), 'fixtures', 'valid', name), 'utf8')) as {
        component: string;
        props: Record<string, unknown>;
      };
    const editor = fixture('constructions-editor.json');
    const keo = fixture('keo-report-drawings.json');
    const verification = fixture('verification-report-review.json');

    const {unmount} = render(
      <A2uiI18nProvider locale="de">{surface(editor.component, editor.props)}</A2uiI18nProvider>,
    );
    expect(screen.getByText(/^Bauteile · \d+$/)).toBeInTheDocument();
    expect(screen.queryByText(/Конструкции ·/)).toBeNull();
    unmount();

    const keoView = render(
      <A2uiI18nProvider locale="en-US">{surface(keo.component, keo.props)}</A2uiI18nProvider>,
    );
    expect(screen.getByText('Drawings')).toBeInTheDocument();
    expect(screen.getByText(/^Section and plan · Danilyuk graph I\/II/)).toBeInTheDocument();
    keoView.unmount();

    render(
      <A2uiI18nProvider locale="pt-BR">
        {surface(verification.component, verification.props)}
      </A2uiI18nProvider>,
    );
    expect(screen.getByText('Verificações')).toBeInTheDocument();
    expect(screen.getAllByText('Aprovada')).toHaveLength(6);
    expect(screen.getByText('Ignorada')).toBeInTheDocument();
  });

  it('вложенный провайдер перекрывает внешний', () => {
    render(
      <A2uiI18nProvider locale="de">
        <A2uiI18nProvider locale="fr-CA">
          <LocaleProbe />
        </A2uiI18nProvider>
      </A2uiI18nProvider>,
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('fr-CA|Afficher');
  });
});

describe('resolveA2uiLocale', () => {
  it.each([
    ['ru', 'ru', 'ru'],
    ['en-GB', 'en', 'en-GB'],
    ['es', 'es', 'es'],
    ['es-MX', 'es', 'es-MX'],
    ['ES-mx', 'es', 'es-MX'],
    ['pt-BR', 'pt', 'pt-BR'],
    ['ca-ES-valencia', 'en', 'en'],
    ['pl', 'en', 'en'],
    ['uk', 'en', 'en'],
    ['', 'en', 'en'],
    ['not a tag', 'en', 'en'],
  ])('%s → словарь %s, тег %s', (tag, language, locale) => {
    expect(resolveA2uiLocale(tag)).toEqual({language, locale});
  });
});

describe('createA2uiI18n', () => {
  it('пустая строка и лишний ключ хоста словарь не портят', () => {
    const {messages} = createA2uiI18n('en', {
      common: {show: '', collapse: 'Hide'},
      unknown: {key: 'x'},
    } as unknown as A2uiMessagesOverride);

    expect(messages.common.show).toBe('Show');
    expect(messages.common.collapse).toBe('Hide');
    expect(messages).not.toHaveProperty('unknown');
  });

  it('частичная форма по числу ложится поверх встроенной', () => {
    const {messages} = createA2uiI18n('en', {report: {inputsCount: {one: 'one value'}}});

    expect(messages.report.inputsCount).toEqual({one: 'one value', other: '{count} values'});
  });
});
