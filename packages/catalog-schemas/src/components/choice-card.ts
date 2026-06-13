import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

export const choiceOptionSchema = z
  .object({
    label: z.string().min(1).max(120),
    value: z.string().min(1).max(120),
    description: z.string().min(1).max(240).optional(),
  })
  .strict();

export const choiceCardSubmitSchema = z
  .object({
    label: z.string().min(1).max(80),
    action: z.string().min(1).max(120),
  })
  .strict();

export const choiceCardPropsSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(240).optional(),
    multiple: z.boolean().optional(),
    choices: z.array(choiceOptionSchema).min(1),
    submit: choiceCardSubmitSchema.optional(),
  })
  .strict();

export type ChoiceOption = z.infer<typeof choiceOptionSchema>;
export type ChoiceCardSubmit = z.infer<typeof choiceCardSubmitSchema>;
export type ChoiceCardProps = z.infer<typeof choiceCardPropsSchema>;

export const choiceCardDefinition: CatalogComponentDefinition<typeof choiceCardPropsSchema> = {
  name: 'ChoiceCard',
  slug: 'choice-card',
  description:
    'An interactive single- or multi-select choice card for human-in-the-loop prompts. Use it when the agent must ask the user to pick one or more options before continuing, with an optional submit action returned to the agent.',
  schema: choiceCardPropsSchema,
};
