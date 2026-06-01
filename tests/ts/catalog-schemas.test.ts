import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  createCatalogArtifact,
  flexTablePropsSchema,
  latexFormulaPropsSchema,
  simpleTablePropsSchema,
} from '@ai37-a2ui/catalog-schemas';

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

    expect(simpleTablePropsSchema.safeParse(simple.props).success).toBe(true);
    expect(flexTablePropsSchema.safeParse(flex.props).success).toBe(true);
    expect(latexFormulaPropsSchema.safeParse(latex.props).success).toBe(true);
  });

  it('rejects invalid fixtures', () => {
    const invalidSimple = readFixture('invalid', 'simple-table-row-length.json');
    const invalidFlex = readFixture('invalid', 'flex-table-span-mismatch.json');
    const invalidLatex = readFixture('invalid', 'latex-formula-empty.json');

    expect(simpleTablePropsSchema.safeParse(invalidSimple.props).success).toBe(false);
    expect(flexTablePropsSchema.safeParse(invalidFlex.props).success).toBe(false);
    expect(latexFormulaPropsSchema.safeParse(invalidLatex.props).success).toBe(false);
  });

  it('builds a catalog artifact with all components', () => {
    const artifact = createCatalogArtifact();

    expect(artifact.catalogId).toContain('a2ui-schemas.dev.ai37.ru');
    expect(Object.keys(artifact.components)).toEqual(['SimpleTable', 'FlexTable', 'LatexFormula']);
  });
});
