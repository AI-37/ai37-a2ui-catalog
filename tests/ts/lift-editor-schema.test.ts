import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  createCatalogArtifact,
  liftEditorPropsSchema,
  type LiftEditorProps,
} from '@ai37/a2ui-catalog-schemas';

const repoRoot = process.cwd();

function fixturePath(group: 'valid' | 'invalid' | 'messages', fileName: string) {
  return path.join(repoRoot, 'fixtures', group, fileName);
}

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(fs.readFileSync(fixturePath(group, fileName), 'utf8')) as {
    component: string;
    props: LiftEditorProps;
  };
}

describe('lift-editor schema', () => {
  it('принимает валидные фикстуры обеих методик', () => {
    const perLift = readFixture('valid', 'lift-editor-per-lift.json');
    const group = readFixture('valid', 'lift-editor-group.json');

    expect(liftEditorPropsSchema.safeParse(perLift.props).success).toBe(true);
    expect(liftEditorPropsSchema.safeParse(group.props).success).toBe(true);
    expect(perLift.props.method).toBe('52941');
    expect(perLift.props.lifts).toHaveLength(2);
    expect(group.props.methodConfigs.find(c => c.method === '34758')?.liftsMode).toBe('group');
  });

  it('отвергает невалидные фикстуры', () => {
    for (const fileName of [
      'lift-editor-unknown-method.json',
      'lift-editor-empty-lift-fields.json',
      'lift-editor-when-length-mismatch.json',
      'lift-editor-empty-draft-action.json',
    ]) {
      expect(liftEditorPropsSchema.safeParse(readFixture('invalid', fileName).props).success).toBe(
        false,
      );
    }
  });

  it('method без конфига в methodConfigs отвергается', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    const result = liftEditorPropsSchema.safeParse({...props, method: 'нет-такой'});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => issue.path.join('.') === 'method')).toBe(true);
    }
  });

  it('methodField должен быть select', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        methodField: {...props.methodField, type: 'text'},
      }).success,
    ).toBe(false);
  });

  it('пустой methodConfigs отвергается', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    expect(liftEditorPropsSchema.safeParse({...props, methodConfigs: []}).success).toBe(false);
  });

  it('длина when каждой строки совпадает с числом sources', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');
    const [first, ...rest] = props.methodConfigs;

    const broken = {
      ...props,
      methodConfigs: [
        {
          ...first!,
          dependentRules: [
            {sources: [{field: 'Vn'}], rows: [{when: ['1', 'лишнее'], set: {h: 1.5}}]},
          ],
        },
        ...rest,
      ],
    };

    const result = liftEditorPropsSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('when');
    }
  });

  it('strict режет неизвестные ключи props и поля', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    expect(liftEditorPropsSchema.safeParse({...props, unknownKey: true}).success).toBe(false);

    const [first, ...rest] = props.methodConfigs;
    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        methodConfigs: [
          {...first!, liftFields: [{...first!.liftFields[0]!, extra: 1}, ...first!.liftFields.slice(1)]},
          ...rest,
        ],
      }).success,
    ).toBe(false);
  });

  it('draftAction опционален, пустая строка отвергается', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    // Валидные фикстуры остаются без пропа — базовое поведение без автосейва.
    expect(props).not.toHaveProperty('draftAction');
    expect(liftEditorPropsSchema.safeParse(props).success).toBe(true);
    expect(liftEditorPropsSchema.safeParse({...props, draftAction: 'lift:draft'}).success).toBe(
      true,
    );
    expect(liftEditorPropsSchema.safeParse({...props, draftAction: ''}).success).toBe(false);
  });

  it('LiftEditor попадает в артефакт каталога', () => {
    const artifact = createCatalogArtifact();

    expect(Object.keys(artifact.components)).toContain('LiftEditor');
  });

  // Конфиги ВСЕХ методик и развёрнутые ряды Прил. Е едут в каждом снапшоте
  // формы (Risks в design.md). Порог — сторож роста, а не норматив: растёт
  // осознанно, вместе с этой строкой.
  it('размер валидной фикстуры остаётся в пределах порога', () => {
    const bytes = fs.statSync(fixturePath('valid', 'lift-editor-per-lift.json')).size;

    expect(bytes).toBeLessThan(32 * 1024);
  });

  it('сквозное A2UI-сообщение несёт валидные props LiftEditor', () => {
    const messages = JSON.parse(
      fs.readFileSync(fixturePath('messages', 'lift-editor-surface.json'), 'utf8'),
    ) as Array<Record<string, any>>;

    const update = messages.find(message => message.updateComponents);
    const component = update!.updateComponents.components[0];
    const {id: _id, component: _component, ...props} = component;

    expect(component.component).toBe('LiftEditor');
    expect(liftEditorPropsSchema.safeParse(props).success).toBe(true);
  });
});
