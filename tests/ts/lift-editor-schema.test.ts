import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  AGENT_RESOURCE_ROUTE,
  LOOKUP_SUGGEST_ROUTE,
  createCatalogArtifact,
  liftEditorPropsSchema,
  recommendResourceVariantSchema,
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

  it('шапка, pendingLabel и подписи сводки опциональны и валидируются', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');
    const [first, ...rest] = props.methodConfigs;

    // Обратная совместимость: без единого нового пропа схема проходит.
    const {
      headerTitle: _h,
      headerContext: _c,
      pendingLabel: _p,
      buildingSources: _b,
      liftSources: _l,
      ...legacy
    } = props as Record<string, unknown> as LiftEditorProps;
    expect(liftEditorPropsSchema.safeParse(legacy).success).toBe(true);

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        headerTitle: 'Параметры расчёта',
        headerContext: 'Проект «ЖК Северный, к.3»',
        pendingLabel: 'Далее',
      }).success,
    ).toBe(true);
    expect(liftEditorPropsSchema.safeParse({...props, pendingLabel: ''}).success).toBe(false);
    expect(liftEditorPropsSchema.safeParse({...props, headerTitle: ''}).success).toBe(false);

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        methodConfigs: [{...first!, buildingKindLabel: 'жилое здание'}, ...rest],
      }).success,
    ).toBe(true);
    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        methodConfigs: [
          {
            ...first!,
            liftFields: [
              {...first!.liftFields[0]!, shortLabel: 'Q'},
              ...first!.liftFields.slice(1),
            ],
          },
          ...rest,
        ],
      }).success,
    ).toBe(true);
    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        methodConfigs: [
          {
            ...first!,
            liftFields: [
              {...first!.liftFields[0]!, shortLabel: ''},
              ...first!.liftFields.slice(1),
            ],
          },
          ...rest,
        ],
      }).success,
    ).toBe(false);
  });

  it('источники значений: валидные принимаются, неизвестный source и лишние ключи режутся', () => {
    const {props} = readFixture('valid', 'lift-editor-per-lift.json');

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        buildingSources: {A: {source: 'question', note: 'из вашего вопроса'}},
        liftSources: [{Q: {source: 'suggested'}}, {}],
      }).success,
    ).toBe(true);

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        buildingSources: {A: {source: 'guessed'}},
      }).success,
    ).toBe(false);

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        liftSources: [{Q: {source: 'suggested', extra: true}}],
      }).success,
    ).toBe(false);

    expect(
      liftEditorPropsSchema.safeParse({
        ...props,
        buildingSources: {A: {source: 'default', note: 'x'.repeat(201)}},
      }).success,
    ).toBe(false);

    expect(readFixture('invalid', 'lift-editor-unknown-source.json')).toBeTruthy();
    expect(
      liftEditorPropsSchema.safeParse(readFixture('invalid', 'lift-editor-unknown-source.json').props)
        .success,
    ).toBe(false);
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

describe('lift-editor recommend', () => {
  it('props без recommend валиден — это путь отката', () => {
    const perLift = readFixture('valid', 'lift-editor-per-lift.json');

    expect('recommend' in perLift.props).toBe(false);
    expect(liftEditorPropsSchema.safeParse(perLift.props).success).toBe(true);
  });

  it('принимает полный recommend', () => {
    const fixture = readFixture('valid', 'lift-editor-recommend.json');
    const parsed = liftEditorPropsSchema.safeParse(fixture.props);

    expect(parsed.success).toBe(true);
    expect(fixture.props.recommend?.resource).toBe('lift-recommend');
    expect(fixture.props.recommend?.params).toHaveLength(4);
    expect(fixture.props.recommend?.params[2]?.scope).toBe('lift');
    expect(fixture.props.recommend?.topCount).toBe(2);
  });

  it('отвергает пустой resource и пустой params', () => {
    for (const fileName of [
      'lift-editor-recommend-empty-resource.json',
      'lift-editor-recommend-empty-params.json',
    ]) {
      expect(liftEditorPropsSchema.safeParse(readFixture('invalid', fileName).props).success).toBe(
        false,
      );
    }
  });

  it('отвергает лишний ключ внутри recommend', () => {
    const fixture = readFixture('valid', 'lift-editor-recommend.json');
    const withExtra = {
      ...fixture.props,
      recommend: {...fixture.props.recommend, unknownKey: 'x'},
    };

    expect(liftEditorPropsSchema.safeParse(withExtra).success).toBe(false);
  });

  it('вариант ответа терпит лишние ключи, но требует apply.values', () => {
    const variant = {
      id: 'v1',
      title: 'ЩЛЗ ПП-1026ЕН · 3 лифта',
      subtitle: '1000 кг · 1,6 м/с',
      notes: ['tи 62 с'],
      tone: 'ok',
      apply: {count: 3, values: {Q: 1000, Vn: 1.6}, buildingValues: {Nl: 3}},
      // Ручка агента вправе дописать своё: версия каталога не должна ронять
      // из-за этого весь список.
      debug: {sweepMs: 12},
    };

    expect(recommendResourceVariantSchema.safeParse(variant).success).toBe(true);
    expect(
      recommendResourceVariantSchema.safeParse({id: 'v2', title: 'Без apply', apply: {count: 2}})
        .success,
    ).toBe(false);
  });

  it('путь ручки ресурсов один на lookup и подбор', () => {
    expect(AGENT_RESOURCE_ROUTE).toBe('/api/agent-resource');
    expect(LOOKUP_SUGGEST_ROUTE).toBe(AGENT_RESOURCE_ROUTE);
  });
});
