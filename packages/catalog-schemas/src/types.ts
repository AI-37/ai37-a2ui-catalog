import {z} from 'zod';

export const textAlignSchema = z.enum(['start', 'center', 'end']);
export type TextAlign = z.infer<typeof textAlignSchema>;

export const cellPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type CellPrimitive = z.infer<typeof cellPrimitiveSchema>;

export interface CatalogComponentDefinition<Schema extends z.ZodTypeAny> {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly schema: Schema;
}

export type JsonSchema = Record<string, unknown>;