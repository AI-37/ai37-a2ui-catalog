import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

export const latexFormulaPropsSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    formula: z.string().min(1),
    displayMode: z.boolean().optional(),
    annotation: z.string().min(1).max(240).optional(),
    bordered: z.boolean().optional(),
  })
  .strict();

export type LatexFormulaProps = z.infer<typeof latexFormulaPropsSchema>;

export const latexFormulaDefinition: CatalogComponentDefinition<typeof latexFormulaPropsSchema> = {
  name: 'LatexFormula',
  slug: 'latex-formula',
  description:
    'A KaTeX-rendered LaTeX formula block for mathematical notation. Use it for equations, derivations, and expressions that must be visually typeset.',
  schema: latexFormulaPropsSchema,
};
