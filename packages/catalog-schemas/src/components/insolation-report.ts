import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Действие карточки отчёта: `{event: {name, context: payload ?? {}}}`. Копия
 * канона ThermalReport/KeoReport — отчётные компоненты независимы, общий
 * рефактор секций отдельным change'ом (Risks design.md).
 */
export const insolationReportActionSchema = z
  .object({
    name: z.string().min(1).max(120),
    label: z.string().min(1).max(80),
    payload: z.record(z.string().max(200)).optional(),
  })
  .strict();

export const insolationReportVerdictSchema = z
  .object({
    status: z.enum(['pass', 'fail']),
    badge: z.string().min(1).max(120),
    headline: z.string().min(1).max(200),
    summary: z.string().min(1).max(400).optional(),
  })
  .strict();

/** Минуты от полуночи: 0 — 00:00, 1440 — 24:00 (Решение 1 design.md). */
const minuteOfDaySchema = z.number().int().min(0).max(1440);

/** Засечка оси: положение в минутах и готовая подпись («10:00»). */
export const insolationTimelineTickSchema = z
  .object({
    at: minuteOfDaySchema,
    label: z.string().min(1).max(20),
  })
  .strict();

/**
 * Сегмент полосы: солнце или тень. `from`/`to` — минуты от полуночи,
 * единственные числа схемы: без них не нарисовать пропорции (прецедент
 * `deviationPct` ThermalReport). Все показываемые длительности — готовые
 * строки в `checks`, минуты на клиенте не форматируются.
 */
export const insolationTimelineSegmentSchema = z
  .object({
    from: minuteOfDaySchema,
    to: minuteOfDaySchema,
    kind: z.enum(['sun', 'shadow']),
    label: z.string().min(1).max(80).optional(),
  })
  .strict();

export const insolationTimelineSchema = z
  .object({
    title: z.string().min(1).max(160),
    axisStart: minuteOfDaySchema,
    axisEnd: minuteOfDaySchema,
    ticks: z.array(insolationTimelineTickSchema).min(2),
    segments: z.array(insolationTimelineSegmentSchema).min(1),
  })
  .strict();

/**
 * Проверка по СанПиН: продолжительность, максимальный непрерывный период,
 * справочная строка «по квартире» со `status: 'info'` и действием перехода к
 * расчёту на уровне проекта (Решение 4 design.md).
 */
export const insolationReportCheckSchema = z
  .object({
    title: z.string().min(1).max(120),
    detail: z.string().min(1).max(300).optional(),
    status: z.enum(['pass', 'fail', 'info']),
    action: insolationReportActionSchema.optional(),
  })
  .strict();

export const insolationReportInputChipSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
  })
  .strict();

export const insolationReportInputGroupSchema = z
  .object({
    label: z.string().min(1).max(120),
    tone: z.enum(['normal', 'warning']),
    chips: z.array(insolationReportInputChipSchema).min(1),
    note: z.string().min(1).max(500).optional(),
  })
  .strict();

export const insolationReportInputsSchema = z
  .object({
    action: insolationReportActionSchema.optional(),
    groups: z.array(insolationReportInputGroupSchema).min(1),
  })
  .strict();

export const insolationReportProtocolSchema = z
  .object({
    meta: z.string().min(1).max(200).optional(),
    /** Краткий вывод расчёта — в UI не показывается, только скачивается. */
    content: z.string().min(1).max(60000),
    /** Без имени файла кнопки «Скачать» нет. */
    downloadFileName: z.string().min(1).max(120).optional(),
    downloadContent: z.string().min(1).max(120000).optional(),
  })
  .strict();

/**
 * Результат расчёта инсоляции. Обязательны только `verdict` и `inputs`.
 * Нормативная логика (зона, нормируемый период, ветвь прерывистой инсоляции,
 * «первый/последний час дня») — на агенте.
 */
export const insolationReportPropsSchema = z
  .object({
    verdict: insolationReportVerdictSchema,
    timeline: insolationTimelineSchema.optional(),
    checks: z.array(insolationReportCheckSchema).min(1).optional(),
    assumptions: z.array(z.string().min(1).max(300)).min(1).optional(),
    inputs: insolationReportInputsSchema,
    protocol: insolationReportProtocolSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const timeline = value.timeline;
    if (timeline === undefined) return;

    if (timeline.axisEnd <= timeline.axisStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'timeline.axisEnd must be greater than timeline.axisStart',
        path: ['timeline', 'axisEnd'],
      });
    }

    for (const [index, segment] of timeline.segments.entries()) {
      if (segment.to <= segment.from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'segment "to" must be greater than "from"',
          path: ['timeline', 'segments', index, 'to'],
        });
      }
    }

    // Непересечение: сегменты сравниваются попарно по возрастанию начала.
    // Стык (`to === from` соседа) разрешён — это соседние солнце и тень.
    const ordered = [...timeline.segments].sort((left, right) => left.from - right.from);
    for (let index = 1; index < ordered.length; index += 1) {
      if (ordered[index]!.from < ordered[index - 1]!.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'timeline segments must not overlap',
          path: ['timeline', 'segments'],
        });
        break;
      }
    }
  });

export type InsolationReportAction = z.infer<typeof insolationReportActionSchema>;
export type InsolationReportVerdict = z.infer<typeof insolationReportVerdictSchema>;
export type InsolationTimelineTick = z.infer<typeof insolationTimelineTickSchema>;
export type InsolationTimelineSegment = z.infer<typeof insolationTimelineSegmentSchema>;
export type InsolationTimeline = z.infer<typeof insolationTimelineSchema>;
export type InsolationReportCheck = z.infer<typeof insolationReportCheckSchema>;
export type InsolationReportInputChip = z.infer<typeof insolationReportInputChipSchema>;
export type InsolationReportInputGroup = z.infer<typeof insolationReportInputGroupSchema>;
export type InsolationReportInputs = z.infer<typeof insolationReportInputsSchema>;
export type InsolationReportProtocol = z.infer<typeof insolationReportProtocolSchema>;
export type InsolationReportProps = z.infer<typeof insolationReportPropsSchema>;

export const insolationReportDefinition: CatalogComponentDefinition<
  typeof insolationReportPropsSchema
> = {
  name: 'InsolationReport',
  slug: 'insolation-report',
  description:
    'A sunlight-duration (insolation, SanPiN 1.2.3685-21) result card: verdict badge with the total duration, a proportional sun/shadow timeline of the calculation day (segments in minutes from midnight, labelled shadow spans, ticks under the bar), SanPiN checks with status dots and optional cross-navigation actions, warning notices for the applied assumptions, input-data chips grouped by provenance and a one-line calculation protocol with a client-side download. All normative logic (zone, normative period, interrupted-insolation branch) stays with the agent.',
  schema: insolationReportPropsSchema,
};
