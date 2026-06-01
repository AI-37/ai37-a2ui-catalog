import {z} from 'zod';
import {cellPrimitiveSchema, type CatalogComponentDefinition, textAlignSchema} from '../types';

export const simpleTableColumnSchema = z
  .object({
    key: z.string().min(1),
    header: z.string().min(1),
    align: textAlignSchema.optional(),
    width: z.string().min(1).optional(),
  })
  .strict();

export const simpleTableRowSchema = z
  .object({
    cells: z.array(cellPrimitiveSchema),
  })
  .strict();

export const simpleTablePropsSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    caption: z.string().min(1).max(240).optional(),
    compact: z.boolean().optional(),
    striped: z.boolean().optional(),
    columns: z.array(simpleTableColumnSchema).min(1),
    rows: z.array(simpleTableRowSchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    for (const [rowIndex, row] of value.rows.entries()) {
      if (row.cells.length !== value.columns.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Row ${rowIndex} must contain exactly ${value.columns.length} cells.`,
          path: ['rows', rowIndex, 'cells'],
        });
      }
    }
  });

export type SimpleTableProps = z.infer<typeof simpleTablePropsSchema>;

export const simpleTableDefinition: CatalogComponentDefinition<typeof simpleTablePropsSchema> = {
  name: 'SimpleTable',
  slug: 'simple-table',
  description:
    'A simple data table with a single header row. Use it for straightforward tabular datasets where each row follows the same column structure.',
  schema: simpleTablePropsSchema,
};
