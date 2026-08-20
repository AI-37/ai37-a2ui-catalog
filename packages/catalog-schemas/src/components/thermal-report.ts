import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * Действие карточки отчёта: диспатчится агенту как
 * `{event: {name, context: payload ?? {}}}` (канон `input.action`).
 * Имена действий схема не фиксирует — их выбирает агент
 * (канонические в spai-teplo-calc: `report_fix_construction`,
 * `report_edit_inputs`, `report_restore_excluded`).
 */
export const thermalReportActionSchema = z
  .object({
    name: z.string().min(1).max(120),
    label: z.string().min(1).max(80),
    payload: z.record(z.string().max(200)).optional(),
  })
  .strict();

export const thermalReportVerdictSchema = z
  .object({
    status: z.enum(['pass', 'fail']),
    badge: z.string().min(1).max(120),
    headline: z.string().min(1).max(200),
    summary: z.string().min(1).max(400).optional(),
  })
  .strict();

export const thermalReportCheckSchema = z
  .object({
    title: z.string().min(1).max(120),
    detail: z.string().min(1).max(300).optional(),
    status: z.enum(['pass', 'fail', 'info']),
  })
  .strict();

export const thermalReportLayersTableSchema = z
  .object({
    title: z.string().min(1).max(120),
    meta: z.string().min(1).max(120).optional(),
    columns: z.array(z.string().min(1).max(60)).min(1),
    rows: z.array(z.array(z.string().max(200))).min(1),
    footer: z
      .object({
        label: z.string().min(1).max(200),
        value: z.string().min(1).max(60),
      })
      .strict(),
  })
  .strict();

export const thermalReportConstructionSchema = z
  .object({
    id: z.string().min(1).max(120),
    name: z.string().min(1).max(200),
    detail: z.string().min(1).max(200),
    /**
     * Отклонение Rпр от Rнорм в процентах — единственное число в props:
     * по знаку рендерер выбирает цвет чипа и сам форматирует
     * «+/−», запятую и «%». Остальные значения приходят готовыми строками.
     */
    deviationPct: z.number().optional(),
    action: thermalReportActionSchema.optional(),
  })
  .strict();

export const thermalReportExcludedSchema = z
  .object({
    title: z.string().min(1).max(200),
    detail: z.string().min(1).max(300).optional(),
    action: thermalReportActionSchema.optional(),
  })
  .strict();

export const thermalReportInputChipSchema = z
  .object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(120),
  })
  .strict();

export const thermalReportInputGroupSchema = z
  .object({
    label: z.string().min(1).max(120),
    tone: z.enum(['normal', 'warning']),
    chips: z.array(thermalReportInputChipSchema).min(1),
    note: z.string().min(1).max(500).optional(),
  })
  .strict();

export const thermalReportInputsSchema = z
  .object({
    action: thermalReportActionSchema.optional(),
    groups: z.array(thermalReportInputGroupSchema).min(1),
  })
  .strict();

export const thermalReportProtocolSchema = z
  .object({
    meta: z.string().min(1).max(200).optional(),
    /** Краткий текстовый вывод расчёта — показывается под катом (plain text). */
    content: z.string().min(1).max(60000),
    /**
     * Имя файла для кнопки «Скачать»: при наличии рендерер отдаёт файл
     * клиентским Blob'ом (агент и транспорт не участвуют). Нет имени — нет
     * кнопки, протокол только раскрывается.
     */
    downloadFileName: z.string().min(1).max(120).optional(),
    /**
     * Содержимое скачиваемого файла (полная markdown-простыня отчёта).
     * Без него «Скачать» отдаёт `content`. В чат простыня не выводится —
     * она живёт только здесь.
     */
    downloadContent: z.string().min(1).max(120000).optional(),
    /**
     * Относительный URL ручки агента (`/api/agent-resource?resource=…`) для
     * «Скачать»: при наличии рендерер показывает dropdown форматов (`.md` —
     * прямая ссылка, `.docx` — конверт-сервис chat-backend); Blob-поля выше
     * остаются fallback'ом для старых payload'ов без URL.
     */
    downloadUrl: z.string().min(1).max(2000).optional(),
  })
  .strict();

/**
 * Результат теплотехнического расчёта. Наполнение задаёт режим (без флага):
 * одна конструкция — `checks` + `layersTable`; список — `constructions`
 * (+ `excluded`). Обязательны только `verdict` и `inputs`; за осмысленную
 * комбинацию секций отвечает агент.
 */
export const thermalReportPropsSchema = z
  .object({
    verdict: thermalReportVerdictSchema,
    checks: z.array(thermalReportCheckSchema).min(1).optional(),
    layersTable: thermalReportLayersTableSchema.optional(),
    constructions: z.array(thermalReportConstructionSchema).min(1).optional(),
    excluded: thermalReportExcludedSchema.optional(),
    assumptions: z.array(z.string().min(1).max(300)).min(1).optional(),
    inputs: thermalReportInputsSchema,
    protocol: thermalReportProtocolSchema.optional(),
  })
  .strict();

export type ThermalReportAction = z.infer<typeof thermalReportActionSchema>;
export type ThermalReportVerdict = z.infer<typeof thermalReportVerdictSchema>;
export type ThermalReportCheck = z.infer<typeof thermalReportCheckSchema>;
export type ThermalReportLayersTable = z.infer<typeof thermalReportLayersTableSchema>;
export type ThermalReportConstruction = z.infer<typeof thermalReportConstructionSchema>;
export type ThermalReportExcluded = z.infer<typeof thermalReportExcludedSchema>;
export type ThermalReportInputChip = z.infer<typeof thermalReportInputChipSchema>;
export type ThermalReportInputGroup = z.infer<typeof thermalReportInputGroupSchema>;
export type ThermalReportInputs = z.infer<typeof thermalReportInputsSchema>;
export type ThermalReportProtocol = z.infer<typeof thermalReportProtocolSchema>;
export type ThermalReportProps = z.infer<typeof thermalReportPropsSchema>;

export const thermalReportDefinition: CatalogComponentDefinition<
  typeof thermalReportPropsSchema
> = {
  name: 'ThermalReport',
  slug: 'thermal-report',
  description:
    'A thermal-calculation result card (SP 50.13330): verdict badge with headline, per-check statuses or a per-construction list with deviation chips and fix actions, layer table, input-data chips grouped by source, and a collapsed calculation protocol. Use it to present the finished Rnorm/Rpr comparison instead of a markdown report.',
  schema: thermalReportPropsSchema,
};
