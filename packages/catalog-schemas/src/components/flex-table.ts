import {z} from 'zod';
import {type CatalogComponentDefinition, textAlignSchema} from '../types';

const emphasisSchema = z.enum(['normal', 'muted', 'strong']);

export const flexTableCellSchema = z
  .object({
    content: z.string().min(1),
    align: textAlignSchema.optional(),
    colSpan: z.number().int().min(1).optional(),
    rowSpan: z.number().int().min(1).optional(),
    emphasis: emphasisSchema.optional(),
  })
  .strict();

export const flexTableRowSchema = z
  .object({
    cells: z.array(flexTableCellSchema).min(1),
  })
  .strict();

const spanWidth = (row: z.infer<typeof flexTableRowSchema>) =>
  row.cells.reduce((sum, cell) => sum + (cell.colSpan ?? 1), 0);

function validateHeaderGrid(rows: z.infer<typeof flexTableRowSchema>[], ctx: z.RefinementCtx) {
  const totalColumns = spanWidth(rows[0]!);
  const activeSpans = Array.from({length: totalColumns}, () => 0);

  for (const [rowIndex, row] of rows.entries()) {
    if (rowIndex > 0) {
      for (let columnIndex = 0; columnIndex < activeSpans.length; columnIndex += 1) {
        activeSpans[columnIndex] = Math.max(0, activeSpans[columnIndex]! - 1);
      }
    }

    let columnIndex = 0;

    for (const [cellIndex, cell] of row.cells.entries()) {
      while (columnIndex < totalColumns && activeSpans[columnIndex]! > 0) {
        columnIndex += 1;
      }

      const colSpan = cell.colSpan ?? 1;
      const rowSpan = cell.rowSpan ?? 1;

      if (columnIndex + colSpan > totalColumns) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Header row ${rowIndex} exceeds the available column span.`,
          path: ['headerRows', rowIndex, 'cells', cellIndex],
        });
        return totalColumns;
      }

      for (let offset = 0; offset < colSpan; offset += 1) {
        if (activeSpans[columnIndex + offset]! > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Header row ${rowIndex} overlaps an active rowSpan.`,
            path: ['headerRows', rowIndex, 'cells', cellIndex],
          });
          return totalColumns;
        }
      }

      for (let offset = 0; offset < colSpan; offset += 1) {
        activeSpans[columnIndex + offset] = rowSpan;
      }

      columnIndex += colSpan;
    }

    if (activeSpans.some(span => span === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Header row ${rowIndex} does not fully cover the table width.`,
        path: ['headerRows', rowIndex],
      });
      return totalColumns;
    }
  }

  return totalColumns;
}

export const flexTablePropsSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    caption: z.string().min(1).max(240).optional(),
    dense: z.boolean().optional(),
    headerRows: z.array(flexTableRowSchema).min(1),
    bodyRows: z.array(flexTableRowSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const headerWidth = validateHeaderGrid(value.headerRows, ctx);

    for (const [index, row] of value.bodyRows.entries()) {
      if (spanWidth(row) !== headerWidth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Body row ${index} has inconsistent total span.`,
          path: ['bodyRows', index],
        });
      }
    }
  });

export type FlexTableProps = z.infer<typeof flexTablePropsSchema>;

export const flexTableDefinition: CatalogComponentDefinition<typeof flexTablePropsSchema> = {
  name: 'FlexTable',
  slug: 'flex-table',
  description:
    'A flexible table with multi-row headers and row or column spans. Use it for grouped metrics, matrix reports, or any dataset that requires composite headers.',
  schema: flexTablePropsSchema,
};
