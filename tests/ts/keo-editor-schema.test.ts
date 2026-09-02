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

  it('keeps a filling made before the labels were added valid (аддитивность)', () => {
    const fixture = readFixture('valid', 'keo-editor.json');
    const {nextLabel, conditionsLabel, ...before} = fixture.props;

    expect(nextLabel).toBeDefined();
    expect(conditionsLabel).toBeDefined();
    expect(keoEditorPropsSchema.safeParse(before).success).toBe(true);
  });

  it('rejects an empty nextLabel', () => {
    const fixture = readFixture('invalid', 'keo-editor-empty-next-label.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('rejects an empty conditionsLabel', () => {
    const fixture = readFixture('invalid', 'keo-editor-empty-conditions-label.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('caps the labels at the lengths of their neighbours', () => {
    const fixture = readFixture('valid', 'keo-editor.json');

    expect(
      keoEditorPropsSchema.safeParse({...fixture.props, nextLabel: 'д'.repeat(81)}).success,
    ).toBe(false);
    expect(
      keoEditorPropsSchema.safeParse({...fixture.props, conditionsLabel: 'у'.repeat(121)}).success,
    ).toBe(false);
  });

  it('validates the first-move filling: город пуст, помещение пустое', () => {
    const fixture = readFixture('valid', 'keo-editor-first-move.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(true);
  });

  it('rejects an empty value on a condition without "type" (выведенное)', () => {
    const fixture = readFixture('invalid', 'keo-editor-empty-condition-value.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
  });

  it('keeps the filling valid when the empty value belongs to a control (правимое)', () => {
    const fixture = readFixture('valid', 'keo-editor.json');
    const conditions = [
      // `type` задан — пустое значение это отсутствие ответа пользователя.
      {name: 'region', label: 'Город', value: '', type: 'lookup', referenceId: 'cities'},
      // `type` не задан — пустой строке взяться неоткуда.
      {name: 'method', label: 'Методика', value: 'СП 367.1325800.2017'},
    ];

    expect(keoEditorPropsSchema.safeParse({...fixture.props, conditions}).success).toBe(true);
  });

  it('validates the filling with draftAction', () => {
    const fixture = readFixture('valid', 'keo-editor-draft.json');

    expect(fixture.props.draftAction).toBe('keo:draft');
    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(true);
  });

  it('keeps a filling without draftAction valid (аддитивность)', () => {
    const fixture = readFixture('valid', 'keo-editor-draft.json');
    const {draftAction, ...before} = fixture.props;

    expect(keoEditorPropsSchema.safeParse(before).success).toBe(true);
  });

  it('rejects an empty draftAction', () => {
    const fixture = readFixture('invalid', 'keo-editor-empty-draft-action.json');

    expect(keoEditorPropsSchema.safeParse(fixture.props).success).toBe(false);
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
