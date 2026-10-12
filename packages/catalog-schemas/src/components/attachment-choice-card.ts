import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Ручка загрузки вложения чата на хосте: same-origin multipart POST `{file, contextId}`,
 * ответ — метаданные файла с `fileId`. Хост (spai-ui) проксирует её в chat-backend, файл ложится
 * на полку треда (`chat-attachment:<fileId>`, docs v2/13). Константа, а не проп: адрес ручки —
 * свойство хоста, а не агента, как и у `AGENT_RESOURCE_ROUTE`.
 */
export const CHAT_ATTACHMENTS_ROUTE = '/api/chat-attachments';

export const attachmentChoiceSkipSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
  })
  .strict();

export const attachmentChoiceAttachSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
    /** Подпись кнопки выбора файла. */
    pickLabel: z.string().min(1).max(80),
    /** Значение `accept` у `<input type="file">`, напр. `image/png`. */
    accept: z.string().min(1).max(200),
    /** Подсказка под строкой выбора: что за файл нужен. */
    hint: z.string().min(1).max(240).optional(),
  })
  .strict();

export const attachmentChoiceCardPropsSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(400).optional(),
    /** Тред, на полку которого грузится файл (contextId хода). */
    contextId: z.string().min(1).max(200),
    skip: attachmentChoiceSkipSchema,
    attach: attachmentChoiceAttachSchema,
    /** Имя действия; обе кнопки шлют его, различаясь `value`. */
    action: z.string().min(1).max(120),
  })
  .strict();

export type AttachmentChoiceSkip = z.infer<typeof attachmentChoiceSkipSchema>;
export type AttachmentChoiceAttach = z.infer<typeof attachmentChoiceAttachSchema>;
export type AttachmentChoiceCardProps = z.infer<typeof attachmentChoiceCardPropsSchema>;

export const attachmentChoiceCardDefinition: CatalogComponentDefinition<
  typeof attachmentChoiceCardPropsSchema
> = {
  name: 'AttachmentChoiceCard',
  slug: 'attachment-choice-card',
  description:
    'A two-way human-in-the-loop card where one option needs a file. One button continues without a file; the other stays disabled until the user picks a file inside the card, which is uploaded to the chat shelf immediately. Use it when the agent asks "continue as is, or with this file?" (e.g. a signature scan). Both buttons dispatch the same action: skip sends { value }, attach sends { value, fileId, fileName }.',
  schema: attachmentChoiceCardPropsSchema,
};
