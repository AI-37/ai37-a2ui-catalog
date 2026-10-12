import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Вердикт проверки контрагента. `warning` — «требует дополнительной
 * проверки»: у расчётных отчётов его нет, у проверки контрагента он
 * основной исход спорного случая. Слово вердикта (`badge`) пишет агент —
 * у вердиктов агента свои формулировки, перечисление здесь только тон.
 */
export const verificationReportVerdictSchema = z
  .object({
    status: z.enum(['pass', 'fail', 'warning']),
    badge: z.string().min(1).max(120),
    headline: z.string().min(1).max(200),
    summary: z.string().min(1).max(400).optional(),
  })
  .strict();

/** Ключевое значение проверки: готовая строка от агента, рендерер не форматирует. */
export const verificationReportDetailSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(600),
  })
  .strict();

/**
 * Источник данных проверки. Без `url` — подпись без ссылки (реестр без
 * публичной карточки). Формат URL схема не проверяет: ссылкой рендерер
 * делает только http(s), остальное показывает подписью.
 */
export const verificationReportSourceSchema = z
  .object({
    label: z.string().min(1).max(120),
    url: z.string().min(1).max(2000).optional(),
  })
  .strict();

/**
 * Строка проверки. Статусы — пять исходов шага агента один-в-один; слово
 * статуса рендерер выбирает сам. Строка раскрывается, только если есть
 * `details` или `sources`: флага «раскрываемая» в контракте нет.
 */
export const verificationReportCheckSchema = z
  .object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    status: z.enum(['pass', 'fail', 'warning', 'error', 'skipped']),
    summary: z.string().min(1).max(400).optional(),
    details: z.array(verificationReportDetailSchema).min(1).max(16).optional(),
    sources: z.array(verificationReportSourceSchema).min(1).max(8).optional(),
  })
  .strict();

/**
 * Результат проверки контрагента: шапка-вердикт и список проверок, каждая
 * строка раскрывается в основание. Точечная проверка — тот же компонент с
 * одной строкой. `note` — пояснение, когда проверок нет (ИНН не найден,
 * контрагент исключён до пайплайна).
 */
export const verificationReportPropsSchema = z
  .object({
    verdict: verificationReportVerdictSchema,
    checks: z.array(verificationReportCheckSchema).max(30),
    note: z.string().min(1).max(1000).optional(),
  })
  .strict();

export type VerificationReportVerdict = z.infer<typeof verificationReportVerdictSchema>;
export type VerificationReportDetail = z.infer<typeof verificationReportDetailSchema>;
export type VerificationReportSource = z.infer<typeof verificationReportSourceSchema>;
export type VerificationReportCheck = z.infer<typeof verificationReportCheckSchema>;
export type VerificationReportCheckStatus = VerificationReportCheck['status'];
export type VerificationReportProps = z.infer<typeof verificationReportPropsSchema>;

export const verificationReportDefinition: CatalogComponentDefinition<
  typeof verificationReportPropsSchema
> = {
  name: 'VerificationReport',
  slug: 'verification-report',
  description:
    'A counterparty-verification result card: a verdict header (status pill, company as the headline, one-line summary) and a list of checks, each with a status and a one-line basis. A check that carries `details` (label/value pairs) or `sources` (registry links) expands to show them; a check without them is a plain row. Use it to present a supplier/contractor check (registry status, OKVED, financials, unfair-supplier registry, website) instead of a markdown checklist; for a single targeted check send one row. Values arrive as ready strings — the renderer does not format numbers.',
  schema: verificationReportPropsSchema,
};
