import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

export const formFieldTypeSchema = z.enum(['text', 'number', 'select', 'boolean', 'lookup']);

export const formFieldSchema = z
  .object({
    name: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    type: formFieldTypeSchema,
    required: z.boolean().optional(),
    options: z.array(z.string()).min(1).optional(),
    // lookup: имя справочника в контексте агента-владельца формы.
    referenceId: z.string().min(1).max(80).optional(),
    // lookup: порог начала поиска; default 3 применяет рендерер.
    minChars: z.number().int().min(1).max(10).optional(),
    placeholder: z.string().min(1).max(120).optional(),
    defaultValue: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        // lookup: value уходит в submit, label показывается в поле.
        z.object({value: z.string(), label: z.string()}).strict(),
      ])
      .optional(),
  })
  .strict()
  .refine(field => field.type !== 'lookup' || typeof field.referenceId === 'string', {
    message: 'referenceId is required when type is "lookup"',
    path: ['referenceId'],
  });

export const formCardSubmitSchema = z
  .object({
    label: z.string().min(1).max(80),
    action: z.string().min(1).max(120),
  })
  .strict();

export const formCardPropsSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(240).optional(),
    fields: z.array(formFieldSchema).min(1),
    submit: formCardSubmitSchema,
  })
  .strict();

export type FormFieldType = z.infer<typeof formFieldTypeSchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type FormCardSubmit = z.infer<typeof formCardSubmitSchema>;
export type FormCardProps = z.infer<typeof formCardPropsSchema>;

export const formCardDefinition: CatalogComponentDefinition<typeof formCardPropsSchema> = {
  name: 'FormCard',
  slug: 'form-card',
  description:
    'An interactive form card with typed fields for human-in-the-loop prompts. Use it when the agent must collect structured parameters (text, number, select, boolean, or lookup with reference-backed autocomplete) from the user and return them via a submit action.',
  schema: formCardPropsSchema,
};
