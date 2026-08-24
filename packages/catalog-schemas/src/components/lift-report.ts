import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Действие карточки отчёта: диспатчится агенту как
 * `{event: {name, context: payload ?? {}}}` (канон `input.action`).
 * Имена действий схема не фиксирует — их выбирает агент
 * (канонические в spai-elevator-calc: `report_apply_suggestion`,
 * `report_edit_inputs`).
 */
export const liftReportActionSchema = z
  .object({
    name: z.string().min(1).max(120),
    label: z.string().min(1).max(80),
    payload: z.record(z.string().max(200)).optional(),
  })
  .strict();

export const liftReportVerdictSchema = z
  .object({
    status: z.enum(['pass', 'fail']),
    badge: z.string().min(1).max(120),
    headline: z.string().min(1).max(200),
    summary: z.string().min(1).max(400).optional(),
  })
  .strict();

/**
 * Вариант из блока «Что изменить»: агент уже пересчитал его и прислал готовую
 * строку результата в `detail`. `action` — «Пересчитать» (принять вариант);
 * без действия вариант показывается статус-лейблом (`statusLabel`), окрашенным
 * тоном. `tone: 'pass'` выделяет рекомендуемый вариант акцентной рамкой.
 */
export const liftReportSuggestionSchema = z
  .object({
    id: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    detail: z.string().min(1).max(300).optional(),
    tone: z.enum(['pass', 'fail', 'neutral']),
    action: liftReportActionSchema.optional(),
    statusLabel: z.string().min(1).max(80).optional(),
  })
  .strict();

export const liftReportSuggestionsSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    items: z.array(liftReportSuggestionSchema).min(1),
  })
  .strict();

// Контракт `inputs` совпадает с `ThermalReport.inputs` (жанр «введено вами /
// принято системой — проверьте» тот же). Схемы объявлены заново, а не
// переиспользованы: компоненты каталога независимы, и правка контракта одного
// не должна молча менять JSON Schema другого (канон групп токенов ce/le/tr).
export const liftReportInputChipSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
  })
  .strict();

export const liftReportInputGroupSchema = z
  .object({
    label: z.string().min(1).max(120),
    tone: z.enum(['normal', 'warning']),
    chips: z.array(liftReportInputChipSchema).min(1),
    note: z.string().min(1).max(500).optional(),
  })
  .strict();

export const liftReportInputsSchema = z
  .object({
    action: liftReportActionSchema.optional(),
    groups: z.array(liftReportInputGroupSchema).min(1),
  })
  .strict();

export const liftReportProtocolSchema = z
  .object({
    meta: z.string().min(1).max(200).optional(),
    /** Краткий вывод расчёта («Итог») — раскрывается под катом (plain text). */
    content: z.string().min(1).max(60000),
    /**
     * Относительный URL ручки агента (`/api/agent-resource?resource=…`) для
     * «Скачать»: рендерер отдаёт обычный `<a href>`, download-заголовки ставит
     * сервер агента. Нет URL — нет ссылки, протокол только раскрывается.
     */
    downloadUrl: z.string().min(1).max(2000).optional(),
  })
  .strict();

/**
 * Результат расчёта лифтов (ГОСТ Р 52941-2008 / ГОСТ 34758-2021). Обязательны
 * `verdict` и `inputs`; `suggestions` («Что изменить») и `protocol` —
 * опциональны, за осмысленную комбинацию секций отвечает агент. Все значения
 * приходят готовыми строками: компонент ничего не считает и не форматирует.
 */
export const liftReportPropsSchema = z
  .object({
    verdict: liftReportVerdictSchema,
    suggestions: liftReportSuggestionsSchema.optional(),
    inputs: liftReportInputsSchema,
    protocol: liftReportProtocolSchema.optional(),
  })
  .strict();

export type LiftReportAction = z.infer<typeof liftReportActionSchema>;
export type LiftReportVerdict = z.infer<typeof liftReportVerdictSchema>;
export type LiftReportSuggestion = z.infer<typeof liftReportSuggestionSchema>;
export type LiftReportSuggestions = z.infer<typeof liftReportSuggestionsSchema>;
export type LiftReportInputChip = z.infer<typeof liftReportInputChipSchema>;
export type LiftReportInputGroup = z.infer<typeof liftReportInputGroupSchema>;
export type LiftReportInputs = z.infer<typeof liftReportInputsSchema>;
export type LiftReportProtocol = z.infer<typeof liftReportProtocolSchema>;
export type LiftReportProps = z.infer<typeof liftReportPropsSchema>;

export const liftReportDefinition: CatalogComponentDefinition<typeof liftReportPropsSchema> = {
  name: 'LiftReport',
  slug: 'lift-report',
  description:
    'A lift-calculation result card (GOST R 52941-2008 / GOST 34758-2021): verdict badge with headline, a "what to change" list of pre-computed options with recalculate actions or status labels, input-data chips grouped by source, and a collapsed calculation protocol with a download link. Use it to present the finished interval/capacity comparison instead of a markdown report.',
  schema: liftReportPropsSchema,
};

export const liftReportNextDefinition: CatalogComponentDefinition<typeof liftReportPropsSchema> = {
  name: 'LiftReportNext',
  slug: 'lift-report-next',
  description:
    'The same lift-calculation result card as `LiftReport` — identical props, identical data contract — rendered on the catalog primitive set shared with `ThermalReportNext` (report row, two-part data chip, status pill, serif verdict headline, sunken note, protocol card, download menu). Differences are behavioural, not contractual: the protocol is a single non-expanding row without `<details>`/`<pre>` (`protocol.content` is never printed on screen), suggestion status words for `pass`/`fail` come from the renderer instead of `statusLabel` (which is still honoured for tones the enumeration does not cover), and the accent border is reserved for the recommended suggestion. Prefer it when the surface should read as one system with `ThermalReportNext`; emit the same props as for `LiftReport`.',
  schema: liftReportPropsSchema,
};
