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
});
