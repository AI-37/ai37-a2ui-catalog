import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  choiceCardPropsSchema,
  constructionsEditorPropsSchema,
  createCatalogArtifact,
  flexTablePropsSchema,
  formCardPropsSchema,
  latexFormulaPropsSchema,
  simpleTablePropsSchema,
} from '@ai37/a2ui-catalog-schemas';

const repoRoot = process.cwd();

function readFixture(group: 'valid' | 'invalid', fileName: string) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, 'fixtures', group, fileName), 'utf8')) as {
    component: string;
    props: unknown;
  };
}

describe('catalog-schemas', () => {
  it('validates valid fixtures', () => {
    const simple = readFixture('valid', 'simple-table.json');
    const flex = readFixture('valid', 'flex-table.json');
    const latex = readFixture('valid', 'latex-formula.json');
    const choice = readFixture('valid', 'choice-card.json');
    const form = readFixture('valid', 'form-card.json');
    const constructions = readFixture('valid', 'constructions-editor.json');
    const conditions = readFixture('valid', 'constructions-editor-conditions.json');

    expect(simpleTablePropsSchema.safeParse(simple.props).success).toBe(true);
    expect(flexTablePropsSchema.safeParse(flex.props).success).toBe(true);
    expect(latexFormulaPropsSchema.safeParse(latex.props).success).toBe(true);
    expect(choiceCardPropsSchema.safeParse(choice.props).success).toBe(true);
    expect(formCardPropsSchema.safeParse(form.props).success).toBe(true);
    expect(constructionsEditorPropsSchema.safeParse(constructions.props).success).toBe(true);
    expect(constructionsEditorPropsSchema.safeParse(conditions.props).success).toBe(true);
  });

  it('rejects invalid fixtures', () => {
    const invalidSimple = readFixture('invalid', 'simple-table-row-length.json');
    const invalidFlex = readFixture('invalid', 'flex-table-span-mismatch.json');
    const invalidLatex = readFixture('invalid', 'latex-formula-empty.json');
    const invalidChoice = readFixture('invalid', 'choice-card-empty-choices.json');
    const invalidForm = readFixture('invalid', 'form-card-invalid-field-type.json');
    const invalidSuggestMode = readFixture('invalid', 'form-card-invalid-suggest-mode.json');
    const invalidConstructionsRef = readFixture(
      'invalid',
      'constructions-editor-missing-reference.json',
    );
    const invalidConstructionsThickness = readFixture(
      'invalid',
      'constructions-editor-negative-thickness.json',
    );
    const invalidConstructionsType = readFixture(
      'invalid',
      'constructions-editor-unknown-type.json',
    );

    expect(simpleTablePropsSchema.safeParse(invalidSimple.props).success).toBe(false);
    expect(flexTablePropsSchema.safeParse(invalidFlex.props).success).toBe(false);
    expect(latexFormulaPropsSchema.safeParse(invalidLatex.props).success).toBe(false);
    expect(choiceCardPropsSchema.safeParse(invalidChoice.props).success).toBe(false);
    expect(formCardPropsSchema.safeParse(invalidForm.props).success).toBe(false);
    expect(formCardPropsSchema.safeParse(invalidSuggestMode.props).success).toBe(false);
    expect(constructionsEditorPropsSchema.safeParse(invalidConstructionsRef.props).success).toBe(
      false,
    );
    expect(
      constructionsEditorPropsSchema.safeParse(invalidConstructionsThickness.props).success,
    ).toBe(false);
    expect(constructionsEditorPropsSchema.safeParse(invalidConstructionsType.props).success).toBe(
      false,
    );
  });

  it('strict режет неизвестные ключи ConstructionsEditor', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;

    expect(
      constructionsEditorPropsSchema.safeParse({...props, unknownKey: true}).success,
    ).toBe(false);

    const constructions = (props.constructions as Array<Record<string, unknown>>).map(entry => ({
      ...entry,
    }));
    constructions[0] = {...constructions[0], extra: 1};
    expect(
      constructionsEditorPropsSchema.safeParse({...props, constructions}).success,
    ).toBe(false);
  });

  it('draftAction опционален, но не пустой', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;
    const {draftAction: _omitted, ...withoutDraft} = props;

    expect(constructionsEditorPropsSchema.safeParse(withoutDraft).success).toBe(true);
    expect(
      constructionsEditorPropsSchema.safeParse({...props, draftAction: 'constructions:draft'})
        .success,
    ).toBe(true);
    expect(constructionsEditorPropsSchema.safeParse({...props, draftAction: ''}).success).toBe(
      false,
    );

    const invalidDraft = readFixture('invalid', 'constructions-editor-empty-draft-action.json');
    expect(constructionsEditorPropsSchema.safeParse(invalidDraft.props).success).toBe(false);
  });

  it('general: пустой блок валиден, неизвестный ключ отклоняется', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;

    const emptyGeneral = {
      buildingType: null,
      city: null,
      tot: null,
      zot: null,
      tn: null,
      tv: null,
      condition: null,
    };
    expect(
      constructionsEditorPropsSchema.safeParse({...props, general: emptyGeneral}).success,
    ).toBe(true);

    const unknownKey = readFixture('invalid', 'constructions-editor-unknown-general-key.json');
    expect(constructionsEditorPropsSchema.safeParse(unknownKey.props).success).toBe(false);
  });

  it('generalSources: валидный блок, отказ на неизвестном ключе', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;

    expect(
      constructionsEditorPropsSchema.safeParse({
        ...props,
        generalSources: {
          tv: {source: 'suggested', note: 'норма для жилых по ГОСТ 30494'},
          city: {source: 'project'},
          condition: {source: 'default'},
        },
      }).success,
    ).toBe(true);

    // Ключ вне `general` — связь «поле ↔ источник» проверяет схема.
    expect(
      constructionsEditorPropsSchema.safeParse({
        ...props,
        generalSources: {unknownField: {source: 'project'}},
      }).success,
    ).toBe(false);

    // Неизвестный источник и пустая запись тоже отвергаются.
    expect(
      constructionsEditorPropsSchema.safeParse({
        ...props,
        generalSources: {tv: {source: 'guessed'}},
      }).success,
    ).toBe(false);
    expect(
      constructionsEditorPropsSchema.safeParse({...props, generalSources: {tv: {}}}).success,
    ).toBe(false);
  });

  it('gsop, conditionsCollapsed и шапка карточки опциональны', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;
    const general = props.general as Record<string, unknown>;

    // Старая фикстура без новых ключей остаётся валидной (аддитивность).
    expect(general.gsop).toBeUndefined();
    expect(constructionsEditorPropsSchema.safeParse(props).success).toBe(true);

    expect(
      constructionsEditorPropsSchema.safeParse({
        ...props,
        general: {...general, gsop: 6380},
        conditionsCollapsed: true,
        headerTitle: 'Параметры расчёта',
        headerContext: 'Проект «ЖК Северный, к.3» · СП 50.13330',
      }).success,
    ).toBe(true);

    // ГСОП «неизвестен» приходит null, а не строкой.
    expect(
      constructionsEditorPropsSchema.safeParse({...props, general: {...general, gsop: null}})
        .success,
    ).toBe(true);
    expect(
      constructionsEditorPropsSchema.safeParse({...props, general: {...general, gsop: '6380'}})
        .success,
    ).toBe(false);
  });

  it('back-кнопка и general опциональны (объединённый экран и путь отката)', () => {
    const valid = readFixture('valid', 'constructions-editor.json');
    const props = valid.props as Record<string, unknown>;

    // Фикстура объединённого экрана — уже без backLabel/backAction.
    expect(props.backLabel).toBeUndefined();
    expect(constructionsEditorPropsSchema.safeParse(props).success).toBe(true);

    // Прежние эмитенты: кнопка возврата на месте, general не прислан.
    const {general: _omitted, ...withoutGeneral} = props;
    expect(
      constructionsEditorPropsSchema.safeParse({
        ...withoutGeneral,
        condition: 'Б',
        backLabel: 'Назад',
        backAction: 'navigate',
        backActionContext: {target: 'climate'},
      }).success,
    ).toBe(true);
  });

  it('builds a superset catalog artifact (base ∪ ai37)', () => {
    const artifact = createCatalogArtifact();
    const names = Object.keys(artifact.components);

    expect(artifact.catalogId).toContain('ai-37.github.io/ai37-a2ui-catalog');
    // доменные ai37-компоненты присутствуют
    for (const ai37 of [
      'SimpleTable',
      'FlexTable',
      'LatexFormula',
      'ChoiceCard',
      'FormCard',
      'ConstructionsEditor',
    ]) {
      expect(names).toContain(ai37);
    }
    // базовые компоненты A2UI подмешаны (надмножество — для вложенности и деградации)
    for (const base of ['Card', 'Column', 'Row', 'Text']) {
      expect(names).toContain(base);
    }
    // надмножество строго больше 5 доменных
    expect(names.length).toBeGreaterThan(5);
  });
});
