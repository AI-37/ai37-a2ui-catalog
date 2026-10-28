import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Состояние пачки предложений. `superseded` — пачку закрыла поправка
 * следующим сообщением: решение по ней больше не принимается, актуальна
 * новая карточка. Слово к состоянию пишет рендерер, агент шлёт перечисление.
 */
export const proposalCardStateSchema = z.enum(['open', 'accepted', 'rejected', 'superseded']);

/**
 * Состояние пункта. `stale` — цель изменилась после того, как пункт
 * предложили (агент вычисляет при чтении по ревизии цели).
 */
export const proposalItemStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'stale']);

/** Вид правки: новое, изменено, удалено. */
export const proposalItemKindSchema = z.enum(['added', 'changed', 'removed']);

/**
 * Пункт пачки: «Что · Было · Станет · С какой даты». Значения — готовые
 * строки от агента, рендерер их не форматирует. У нового пункта обычно нет
 * `before`, у удалённого — `after`; схема этого не требует, рендерер
 * показывает то, что пришло.
 */
export const proposalItemSchema = z
  .object({
    id: z.string().min(1).max(120),
    kind: proposalItemKindSchema,
    label: z.string().min(1).max(200),
    before: z.string().min(1).max(200).optional(),
    after: z.string().min(1).max(200).optional(),
    /** «С какой даты» действует изменение — готовая строка, напр. `01.11.2026`. */
    effectiveFrom: z.string().min(1).max(40).optional(),
    /** Без поля пункт ждёт решения (`pending`). */
    status: proposalItemStatusSchema.optional(),
  })
  .strict();

/** Откуда предложение: подпись (`Голосовое сообщение · 0:21`) и цитата. */
export const proposalSourceSchema = z
  .object({
    label: z.string().min(1).max(120).optional(),
    quote: z.string().min(1).max(1000),
  })
  .strict();

/** Кнопка подтверждения: шлёт `action` с контекстом `{proposalId, decision: 'accept'}`. */
export const proposalConfirmSchema = z
  .object({
    label: z.string().min(1).max(80),
    action: z.string().min(1).max(120),
  })
  .strict();

/**
 * Ссылка на страницу решений («Решить в „Требуют решения“»). Показывается
 * вместо кнопки, когда живой задачи у агента уже нет: `confirm` не пришёл
 * или поверхность прошлая (режим «только чтение» хоста). Ссылкой рендерер
 * делает только путь от корня хоста или http(s), остальное не показывает.
 */
export const proposalDecideLinkSchema = z
  .object({
    label: z.string().min(1).max(120),
    href: z.string().min(1).max(2000),
  })
  .strict();

/**
 * Карточка подтверждения пачки предложений. `view` выбирает раскладку
 * пунктов: `list` — строки «новое / изменено / удалено», `table` — таблица
 * «Что · Было · Станет · С какой даты». `canDecide: false` — у зрителя нет
 * права решать: карточка без кнопки и без ссылки.
 */
export const proposalCardPropsSchema = z
  .object({
    proposalId: z.string().min(1).max(200),
    title: z.string().min(1).max(120),
    state: proposalCardStateSchema,
    view: z.enum(['list', 'table']).optional(),
    items: z.array(proposalItemSchema).min(1).max(50),
    source: proposalSourceSchema.optional(),
    /** Приглушённая строка под пунктами: что будет после подтверждения и кто может решать. */
    note: z.string().min(1).max(400).optional(),
    confirm: proposalConfirmSchema.optional(),
    canDecide: z.boolean().optional(),
    decideLink: proposalDecideLinkSchema.optional(),
  })
  .strict();

export type ProposalCardState = z.infer<typeof proposalCardStateSchema>;
export type ProposalItemStatus = z.infer<typeof proposalItemStatusSchema>;
export type ProposalItemKind = z.infer<typeof proposalItemKindSchema>;
export type ProposalItem = z.infer<typeof proposalItemSchema>;
export type ProposalSource = z.infer<typeof proposalSourceSchema>;
export type ProposalConfirm = z.infer<typeof proposalConfirmSchema>;
export type ProposalDecideLink = z.infer<typeof proposalDecideLinkSchema>;
export type ProposalCardProps = z.infer<typeof proposalCardPropsSchema>;

export const proposalCardDefinition: CatalogComponentDefinition<typeof proposalCardPropsSchema> = {
  name: 'ProposalCard',
  slug: 'proposal-card',
  description:
    'A human-in-the-loop confirmation card for a batch of proposed changes (a data agent never writes on its own: it proposes, a person confirms). Shows a title, the batch state (open, accepted, rejected, superseded), the items either as a list grouped by kind (added / changed / removed) or as a table "What · Was · Becomes · Effective from", an optional quote of the source message, an optional note, and a confirm button that dispatches `action` with context { proposalId, decision: "accept" }. Item statuses: pending, accepted, rejected, stale. When the agent task is gone (no `confirm`, or the host shows the surface read-only) the card shows `decideLink` instead of the button; with `canDecide: false` it shows neither. Values arrive as ready strings — the renderer does not format them.',
  schema: proposalCardPropsSchema,
};
