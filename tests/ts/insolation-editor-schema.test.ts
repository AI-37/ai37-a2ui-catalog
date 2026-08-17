import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {insolationEditorPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('insolation-editor schema', () => {
  it('validates the fixture (Тюмень, этаж 3 ЮВ, здание 38/45/60 м)', () => {
    const fixture = readFixture('valid', 'insolation-editor.json');

    expect(insolationEditorPropsSchema.safeParse(fixture.props).success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    const fixture = readFixture('valid', 'insolation-editor.json');

    expect(
      insolationEditorPropsSchema.safeParse({...fixture.props, sitePlanFile: 'plan.dwg'}).success,
    ).toBe(false);
  });

  it('rejects a source kind outside the calc dictionary', () => {
    const fixture = readFixture('invalid', 'insolation-editor-unknown-source.json');

    expect(insolationEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('accepts an empty building list — «застройка не указана» is a valid state', () => {
    const fixture = readFixture('valid', 'insolation-editor.json');

    expect(
      insolationEditorPropsSchema.safeParse({...fixture.props, buildings: []}).success,
    ).toBe(true);
  });
});
