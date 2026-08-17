import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {keoEditorPropsSchema} from '@ai37/a2ui-catalog-schemas';

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'fixtures', group, fileName), 'utf8'),
  ) as {component: string; props: Record<string, unknown>};
}

describe('keo-editor schema', () => {
  it('validates the fixture (жилая комната, Тюмень — группа 1)', () => {
    const fixture = readFixture('valid', 'keo-editor.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    const fixture = readFixture('valid', 'keo-editor.json');

    expect(
      keoEditorPropsSchema.safeParse({...fixture.props, workingPlane: '0,8 м'}).success,
    ).toBe(false);
  });

  it('rejects revealBy pointing at a field the template does not declare', () => {
    const fixture = readFixture('invalid', 'keo-editor-unknown-reveal.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('rejects a ratio-max rule without "under" or "limit"', () => {
    const fixture = readFixture('valid', 'keo-editor.json');
    const props = {
      ...fixture.props,
      validationRules: [
        {
          kind: 'ratio-max',
          over: ['depth'],
          message: 'd_п/h₀₁ ≤ 2,5',
          targets: ['depth'],
        },
      ],
    };

    expect(keoEditorPropsSchema.safeParse(props).success).toBe(false);
  });

  it('rejects a source kind outside the calc dictionary', () => {
    const fixture = readFixture('valid', 'keo-editor.json');
    const rooms = [
      {
        values: {purpose: 'Кухня'},
        // `default` — вид источника ConstructionsEditor/LiftEditor; у расчётных
        // редакторов его нет, вместо него `assumption`.
        sources: {purpose: {source: 'default'}},
      },
    ];

    expect(keoEditorPropsSchema.safeParse({...fixture.props, rooms}).success).toBe(false);
  });
});
