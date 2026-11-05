import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  CATALOG_COMPONENT_NAMES,
  createCatalogArtifact,
  proposalCardPropsSchema,
} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('proposal-card schema', () => {
  it('принимает список из голосового, таблицу параметров и заменённую пачку', () => {
    for (const name of [
      'proposal-card-voice.json',
      'proposal-card-params.json',
      'proposal-card-superseded.json',
      'proposal-card-documents.json',
      'proposal-card-voice-links.json',
    ]) {
      const result = proposalCardPropsSchema.safeParse(readFixture('valid', name).props);
      expect(result.success, name).toBe(true);
    }
  });

  it('отклоняет чужое состояние, пустую пачку, чужой вид правки и кнопку без action', () => {
    for (const name of [
      'proposal-card-unknown-state.json',
      'proposal-card-empty-items.json',
      'proposal-card-unknown-item-kind.json',
      'proposal-card-confirm-without-action.json',
      'proposal-card-item-source-without-text.json',
      'proposal-card-item-source-not-object.json',
      'proposal-card-source-link-without-label.json',
    ]) {
      const result = proposalCardPropsSchema.safeParse(readFixture('invalid', name).props);
      expect(result.success, name).toBe(false);
    }
  });

  it('отклоняет лишний ключ у пункта', () => {
    const props = readFixture('valid', 'proposal-card-superseded.json').props as {
      items: Array<Record<string, unknown>>;
    };
    const items = [{...props.items[0], color: 'red'}];
    expect(proposalCardPropsSchema.safeParse({...props, items}).success).toBe(false);
  });

  describe('источник пункта', () => {
    const base = () =>
      readFixture('valid', 'proposal-card-superseded.json').props as {items: Array<Record<string, unknown>>};
    const withItemSource = (source: unknown) => {
      const props = base();
      return proposalCardPropsSchema.safeParse({...props, items: [{...props.items[0], source}]});
    };

    it('пункт без источника валиден: старые карточки не ломаются', () => {
      expect(base().items.every(item => !('source' in item))).toBe(true);
      expect(proposalCardPropsSchema.safeParse(base()).success).toBe(true);
    });

    it.each([
      ['только подпись', {label: 'Техпаспорт здания.xlsx, лист «Экспликация», D14'}],
      ['подпись и цитата', {label: 'Счёт за сентябрь.pdf, стр. 2', quote: 'Цена за 1 кВт·ч — 7,48 руб.'}],
      ['подпись, цитата и ссылка', {label: 'Акт.pdf, стр. 2', quote: '450 кВт', href: '/projects/p/documents'}],
      ['только цитата', {quote: 'Цена за 1 кВт·ч — 7,48 руб.'}],
    ])('принимает %s', (_name, source) => {
      expect(withItemSource(source).success).toBe(true);
    });

    it.each([
      ['строку вместо объекта', 'Счёт за сентябрь.pdf'],
      ['пустой объект', {}],
      ['одну ссылку без подписи и цитаты', {href: '/projects/p/documents'}],
      ['подпись числом', {label: 2}],
      ['цитату числом', {label: 'Счёт.pdf', quote: 7.48}],
      ['пустую подпись', {label: ''}],
      ['пустую ссылку', {label: 'Счёт.pdf', href: ''}],
      ['подпись длиннее 120', {label: 'а'.repeat(121)}],
      ['цитату длиннее 1000', {label: 'Счёт.pdf', quote: 'а'.repeat(1001)}],
      ['лишний ключ', {label: 'Счёт.pdf', page: 2}],
    ])('отклоняет %s', (_name, source) => {
      expect(withItemSource(source).success).toBe(false);
    });

    it('источник пачки — та же форма: подпись без цитаты и ссылка', () => {
      const props = readFixture('valid', 'proposal-card-voice.json').props;
      for (const source of [{label: 'Документация проекта · 3 файла'}, {quote: 'Две вытяжки', href: 'https://x/y'}]) {
        expect(proposalCardPropsSchema.safeParse({...props, source}).success).toBe(true);
      }
      expect(proposalCardPropsSchema.safeParse({...props, source: {href: '/x'}}).success).toBe(false);
    });
  });

  describe('ссылки источника', () => {
    const withLinks = (links: unknown) => {
      const props = readFixture('valid', 'proposal-card-voice.json').props as {source: Record<string, unknown>};
      return proposalCardPropsSchema.safeParse({...props, source: {...props.source, links}});
    };

    it.each([
      ['ссылку с href', [{label: 'Голосовое сообщение 1', href: '/documents/ser_1'}]],
      ['подпись без href', [{label: 'Голосовое сообщение 1'}]],
      [
        'ссылку и подпись вперемешку',
        [{label: 'Запись 1', href: 'https://ds.example/documents/ser_1'}, {label: 'Запись 2'}],
      ],
      ['пустой список', []],
      ['двадцать ссылок', Array.from({length: 20}, (_, index) => ({label: `Запись ${index + 1}`}))],
    ])('принимает %s', (_name, links) => {
      expect(withLinks(links).success).toBe(true);
    });

    it('без поля источник валиден, как в 0.44.0', () => {
      const props = readFixture('valid', 'proposal-card-voice.json').props as {source: Record<string, unknown>};
      expect('links' in props.source).toBe(false);
      expect(proposalCardPropsSchema.safeParse(props).success).toBe(true);
    });

    it.each([
      ['ссылку без подписи', [{href: '/documents/ser_1'}]],
      ['пустую подпись', [{label: ''}]],
      ['пустой href', [{label: 'Запись 1', href: ''}]],
      ['подпись длиннее 120', [{label: 'а'.repeat(121)}]],
      ['лишний ключ у ссылки', [{label: 'Запись 1', seriesId: 'ser_1'}]],
      ['строку вместо объекта', ['Запись 1']],
      ['объект вместо списка', {label: 'Запись 1'}],
      ['больше двадцати ссылок', Array.from({length: 21}, (_, index) => ({label: `Запись ${index + 1}`}))],
    ])('отклоняет %s', (_name, links) => {
      expect(withLinks(links).success).toBe(false);
    });

    it('одни ссылки без подписи и цитаты источник не делают', () => {
      const props = readFixture('valid', 'proposal-card-voice.json').props;
      const source = {links: [{label: 'Голосовое сообщение 1'}]};
      expect(proposalCardPropsSchema.safeParse({...props, source}).success).toBe(false);
    });

    it('у источника пункта ссылки той же формы', () => {
      type Props = {items: Array<Record<string, unknown>>};
      const props = readFixture('valid', 'proposal-card-superseded.json').props as Props;
      const source = {label: 'Акт.pdf, стр. 2', links: [{label: 'Приложение 1', href: '/documents/ser_2'}]};
      const items = [{...props.items[0], source}];
      expect(proposalCardPropsSchema.safeParse({...props, items}).success).toBe(true);
    });
  });

  it('зарегистрирована в каталоге с JSON-схемой props', () => {
    expect(CATALOG_COMPONENT_NAMES).toContain('ProposalCard');
    const entry = createCatalogArtifact().components.ProposalCard as {
      schemaPath: string;
      propsSchema: {definitions: {ProposalCard: {required: string[]}}};
    };
    expect(entry.schemaPath).toMatch(/\/components\/proposal-card\.schema\.json$/);
    expect(entry.propsSchema.definitions.ProposalCard.required).toEqual(
      expect.arrayContaining(['proposalId', 'title', 'state', 'items']),
    );
  });

  it('JSON-схема пункта знает необязательный source {label, quote, href, links}', () => {
    const entry = createCatalogArtifact().components.ProposalCard as {
      propsSchema: {
        definitions: {
          ProposalCard: {
            properties: {
              items: {items: {required: string[]; properties: Record<string, {properties?: object; required?: string[]}>}};
            };
          };
        };
      };
    };
    const item = entry.propsSchema.definitions.ProposalCard.properties.items.items;
    expect(item.required).not.toContain('source');
    expect(Object.keys(item.properties.source!.properties ?? {})).toEqual(['label', 'quote', 'href', 'links']);
    expect(item.properties.source!.required ?? []).toEqual([]);
    type LinksSchema = {items: {required: string[]; properties: object}};
    const links = (item.properties.source!.properties as Record<string, LinksSchema>).links!;
    expect(links.items.required).toEqual(['label']);
    expect(Object.keys(links.items.properties)).toEqual(['label', 'href']);
  });
});
