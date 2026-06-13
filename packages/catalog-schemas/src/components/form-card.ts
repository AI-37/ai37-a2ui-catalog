import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

export const formFieldTypeSchema = z.enum(['text', 'number', 'select', 'boolean']);

export const formFieldSchema = z
  .object({
    name: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    type: formFieldTypeSchema,
    required: z.boolean().optional(),
    options: z.array(z.string()).min(1).optional(),
    placeholder: z.string().min(1).max(120).optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  })
  .strict();

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
    'An interactive form card with typed fields for human-in-the-loop prompts. Use it when the agent must collect structured parameters (text, number, select, or boolean) from the user and return them via a submit action.',
  schema: formCardPropsSchema,
};
