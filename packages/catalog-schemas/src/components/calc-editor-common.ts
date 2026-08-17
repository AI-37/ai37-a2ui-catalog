import {z} from 'zod';
import {formFieldBaseSchema} from './form-card';

/**
 * Общие куски контракта РАСЧЁТНЫХ редакторов (КЕО, инсоляция): вид источника
 * значения, описатель поля, readonly-строка условий и submit.
 *
 * Почему свой словарь источников, а не констракшновый
 * (`constructionsFieldSourceSchema`, четыре вида): у расчётных модулей есть
 * значения, ПОСЧИТАННЫЕ агентом (отметка центра окна по этажу, худший день
 * периода) и ДОПУЩЕНИЯ (отражение фасада ρ_ф 0,5) — метка обязана их
 * различать. Расширять общий словарь нельзя: подписи и оформление
 * ConstructionsEditor/LiftEditor завязаны ровно на четыре вида, и правка
 * задела бы их капабилити.
 */
export const calcFieldSourceKindSchema = z.enum([
  'project',
  'question',
  'suggested',
  'calculated',
  'assumption',
]);

export const calcFieldSourceSchema = z
  .object({
    source: calcFieldSourceKindSchema,
    // Человеческое обоснование одной строкой («худший день периода — 22 апреля»).
    note: z.string().min(1).max(200).optional(),
  })
  .strict();

/**
 * Источники значений одного экрана (помещения, расчётной точки, здания): имя
 * поля → источник. Параллельный блок, а не обёртка над значениями: payload
 * submit'а от провенанса не меняется, наружу источники не уходят.
 */
export const calcFieldSourcesSchema = z.record(z.string(), calcFieldSourceSchema);

/**
 * Раскрытие поля по значению поля-триггера того же экрана (ветка затенения
 * схемы N1). Один механизм на компонент, без вложенных условий.
 */
export const calcRevealBySchema = z
  .object({
    field: z.string().min(1).max(80),
    values: z.array(z.string().min(1).max(120)).min(1),
  })
  .strict();

/**
 * Поле расчётного редактора — базовое поле FormCard плюс аддитивные ключи.
 * Новой параллельной модели поля в каталоге не заводим (прецедент LiftEditor).
 */
export const calcEditorFieldSchema = formFieldBaseSchema
  .extend({
    // `lookup` расчётным редакторам не нужен: справочники живут у агента.
    type: z.enum(['text', 'number', 'select', 'boolean']),
    hint: z.string().min(1).max(200).optional(),
    // Подпись поля в строке-сводке свёрнутой секции; без неё берётся `name`.
    shortLabel: z.string().min(1).max(40).optional(),
    // Пояснение к варианту списка («не указана — принята северная»); в submit
    // уходит само значение, не текст.
    optionNotes: z.record(z.string(), z.string()).optional(),
    revealBy: calcRevealBySchema.optional(),
    // Предупреждение, зависящее от значения САМОГО поля: «нет» у затенения —
    // подпись о принятом открытом горизонте. Текст приходит от агента.
    valueWarnings: z.record(z.string(), z.string()).optional(),
    // Границы предупреждающей проверки числа; нарушение не блокирует submit.
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .strict();

/** Readonly-строка блока «Условия»: значение приходит готовой строкой. */
export const calcConditionSchema = z
  .object({
    name: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    value: z.string().min(1).max(200),
    note: z.string().min(1).max(200).optional(),
  })
  .strict();

/** Единственный action расчётного редактора — «Рассчитать». */
export const calcSubmitSchema = z
  .object({
    name: z.string().min(1).max(120),
    label: z.string().min(1).max(80),
  })
  .strict();

export type CalcFieldSourceKind = z.infer<typeof calcFieldSourceKindSchema>;
export type CalcFieldSource = z.infer<typeof calcFieldSourceSchema>;
export type CalcFieldSources = z.infer<typeof calcFieldSourcesSchema>;
export type CalcRevealBy = z.infer<typeof calcRevealBySchema>;
export type CalcEditorField = z.infer<typeof calcEditorFieldSchema>;
export type CalcCondition = z.infer<typeof calcConditionSchema>;
export type CalcSubmit = z.infer<typeof calcSubmitSchema>;
