import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Действие карточки отчёта: диспатчится агенту как
 * `{event: {name, context: payload ?? {}}}` (канон `input.action`). Имена
 * действий схема не фиксирует — их выбирает агент КЕО (`report_recalc`,
 * `report_edit_inputs`, …).
 *
 * Копия канона ThermalReport, а не общая схема: отчётные компоненты
 * независимы, а общий рефактор секций отчётов — отдельный change (Risks
 * design.md).
 */
export const keoReportActionSchema = z
  .object({
    name: z.string().min(1).max(120),
    label: z.string().min(1).max(80),
    payload: z.record(z.string().max(200)).optional(),
  })
  .strict();

export const keoReportVerdictSchema = z
  .object({
    status: z.enum(['pass', 'fail']),
    badge: z.string().min(1).max(120),
    headline: z.string().min(1).max(200),
    summary: z.string().min(1).max(400).optional(),
  })
  .strict();

/**
 * Карточка секции «Что изменить». `tone` управляет только оформлением
 * (success — акцентная рамка, fail — detail danger-цветом, neutral —
 * обычная); наличие кнопки определяет ТОЛЬКО `action` — агент волен сочетать
 * тон и действие как нужно (Решение 2 design.md).
 */
export const keoReportRecommendationSchema = z
  .object({
    title: z.string().min(1).max(200),
    detail: z.string().min(1).max(300),
    tone: z.enum(['success', 'neutral', 'fail']),
    action: keoReportActionSchema.optional(),
  })
  .strict();

/** Строка результата по помещению (мультипомещенный расчёт). */
export const keoReportRoomSchema = z
  .object({
    id: z.string().min(1).max(120),
    name: z.string().min(1).max(200),
    // Готовые строки с запятой и «%»: форматирование — у агента.
    value: z.string().min(1).max(60),
    norm: z.string().min(1).max(60),
    status: z.enum(['pass', 'fail']),
    action: keoReportActionSchema.optional(),
  })
  .strict();

export const keoReportInputChipSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
  })
  .strict();

export const keoReportInputGroupSchema = z
  .object({
    label: z.string().min(1).max(120),
    tone: z.enum(['normal', 'warning']),
    chips: z.array(keoReportInputChipSchema).min(1),
    note: z.string().min(1).max(500).optional(),
  })
  .strict();

export const keoReportInputsSchema = z
  .object({
    action: keoReportActionSchema.optional(),
    groups: z.array(keoReportInputGroupSchema).min(1),
  })
  .strict();

export const keoReportProtocolSchema = z
  .object({
    meta: z.string().min(1).max(200).optional(),
    /** Краткий вывод расчёта — в UI не показывается, только скачивается. */
    content: z.string().min(1).max(60000),
    /** Без имени файла кнопки «Скачать» нет. */
    downloadFileName: z.string().min(1).max(120).optional(),
    /** Полный протокол (состав таблиц А.1/Б.1/Б.2 ГОСТ Р 21.514) формирует агент. */
    downloadContent: z.string().min(1).max(120000).optional(),
  })
  .strict();

/**
 * Результат расчёта КЕО. Обязательны только `verdict` и `inputs`; за
 * осмысленную комбинацию секций отвечает агент. Нормативная логика (сравнение
 * e_p с e_н, допуск −10 % по СП 367 п. А.2.12, источник нормы) — на агенте:
 * компонент получает готовый статус и строки.
 */
export const keoReportPropsSchema = z
  .object({
    verdict: keoReportVerdictSchema,
    recommendations: z.array(keoReportRecommendationSchema).min(1).optional(),
    rooms: z.array(keoReportRoomSchema).min(1).optional(),
    assumptions: z.array(z.string().min(1).max(300)).min(1).optional(),
    inputs: keoReportInputsSchema,
    protocol: keoReportProtocolSchema.optional(),
  })
  .strict();

export type KeoReportAction = z.infer<typeof keoReportActionSchema>;
export type KeoReportVerdict = z.infer<typeof keoReportVerdictSchema>;
export type KeoReportRecommendation = z.infer<typeof keoReportRecommendationSchema>;
export type KeoReportRoom = z.infer<typeof keoReportRoomSchema>;
export type KeoReportInputChip = z.infer<typeof keoReportInputChipSchema>;
export type KeoReportInputGroup = z.infer<typeof keoReportInputGroupSchema>;
export type KeoReportInputs = z.infer<typeof keoReportInputsSchema>;
export type KeoReportProtocol = z.infer<typeof keoReportProtocolSchema>;
export type KeoReportProps = z.infer<typeof keoReportPropsSchema>;

export const keoReportDefinition: CatalogComponentDefinition<typeof keoReportPropsSchema> = {
  name: 'KeoReport',
  slug: 'keo-report',
  description:
    'A daylight-factor (KEO, SP 367.1325800) result card: verdict badge with the headline value against the norm, a "what to change" section of toned recommendation cards (each may carry a recalculate action with payload), optional per-room results, input-data chips grouped by provenance (with a dashed "assumed by the system — check it" group) and a one-line calculation protocol with a client-side download. Use it to present the finished KEO comparison instead of a markdown report; all normative logic stays with the agent.',
  schema: keoReportPropsSchema,
};
