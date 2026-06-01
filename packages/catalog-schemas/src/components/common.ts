import {z} from 'zod';

export const TextAlignSchema = z.enum(['start', 'center', 'end']);
export type TextAlign = z.infer<typeof TextAlignSchema>;

export const CellPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type CellPrimitive = z.infer<typeof CellPrimitiveSchema>;

export interface ComponentDefinition<Schema extends z.ZodTypeAny> {
  name: string;
  description: string;
  schema: Schema;
}

export const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
