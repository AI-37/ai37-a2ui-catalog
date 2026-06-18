import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  choiceCardPropsSchema,
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

    expect(simpleTablePropsSchema.safeParse(simple.props).success).toBe(true);
    expect(flexTablePropsSchema.safeParse(flex.props).success).toBe(true);
    expect(latexFormulaPropsSchema.safeParse(latex.props).success).toBe(true);
    expect(choiceCardPropsSchema.safeParse(choice.props).success).toBe(true);
    expect(formCardPropsSchema.safeParse(form.props).success).toBe(true);
  });

  it('rejects invalid fixtures', () => {
    const invalidSimple = readFixture('invalid', 'simple-table-row-length.json');
    const invalidFlex = readFixture('invalid', 'flex-table-span-mismatch.json');
    const invalidLatex = readFixture('invalid', 'latex-formula-empty.json');
    const invalidChoice = readFixture('invalid', 'choice-card-empty-choices.json');
    const invalidForm = readFixture('invalid', 'form-card-invalid-field-type.json');

    expect(simpleTablePropsSchema.safeParse(invalidSimple.props).success).toBe(false);
    expect(flexTablePropsSchema.safeParse(invalidFlex.props).success).toBe(false);
    expect(latexFormulaPropsSchema.safeParse(invalidLatex.props).success).toBe(false);
    expect(choiceCardPropsSchema.safeParse(invalidChoice.props).success).toBe(false);
    expect(formCardPropsSchema.safeParse(invalidForm.props).success).toBe(false);
  });

  it('builds a superset catalog artifact (base ∪ ai37)', () => {
    const artifact = createCatalogArtifact();
    const names = Object.keys(artifact.components);

    expect(artifact.catalogId).toContain('ai-37.github.io/ai37-a2ui-catalog');
    // доменные ai37-компоненты присутствуют
    for (const ai37 of ['SimpleTable', 'FlexTable', 'LatexFormula', 'ChoiceCard', 'FormCard']) {
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
