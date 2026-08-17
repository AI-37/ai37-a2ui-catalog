import {z} from 'zod';
import {
  calcConditionSchema,
  calcEditorFieldSchema,
  calcFieldSourcesSchema,
  calcSubmitSchema,
} from './calc-editor-common';
import {type CatalogComponentDefinition} from '../types';

/** Значения одной расчётной точки (окна) плюс источники этих значений. */
export const insolationPointSchema = z
  .object({
    // Без имени карточка подписывается как «{pointLabel} {номер}».
    name: z.string().min(1).max(120).optional(),
    values: z.record(z.string(), z.unknown()),
    sources: calcFieldSourcesSchema.optional(),
  })
  .strict();

/**
 * Строка затеняющего здания. Список общий для всех расчётных точек (как на
 * генплане): связь «какое здание какую точку затеняет» вычисляет агент, не
 * пользователь (Решение 1 design.md).
 */
export const insolationBuildingSchema = z
  .object({
    values: z.record(z.string(), z.unknown()),
    sources: calcFieldSourcesSchema.optional(),
  })
  .strict();

/**
 * Плашка-предупреждение секции: упрощённая модель прямоугольных экранов, «не
 * указанная застройка завышает результат». Текст — от агента; submit не
 * блокируется.
 */
export const insolationNoticeSchema = z
  .object({
    text: z.string().min(1).max(400),
    // Без тона — предупреждение (основной случай макета).
    tone: z.enum(['warning', 'info']).optional(),
  })
  .strict();

/**
 * Сбор исходных данных расчёта инсоляции (СанПиН 1.2.3685-21, методика
 * ГОСТ Р 57795) одним сообщением: readonly-условия, N расчётных точек и M
 * затеняющих зданий с локальным добавлением и удалением, один submit с полным
 * документом `{conditions, points, buildings}`. Солнечной геометрии и таблиц
 * нормативов в компоненте нет — широтная зона, часы, период и худший день
 * приходят готовыми строками.
 */
export const insolationEditorPropsSchema = z
  .object({
    title: z.string().min(1).max(120),
    meta: z.string().min(1).max(200).optional(),
    conditions: z.array(calcConditionSchema).min(1),
    pointTemplate: z
      .object({
        title: z.string().min(1).max(120),
        fields: z.array(calcEditorFieldSchema).min(1),
      })
      .strict(),
    points: z.array(insolationPointSchema).min(1),
    pointLabel: z.string().min(1).max(80),
    addPointLabel: z.string().min(1).max(80),
    removePointLabel: z.string().min(1).max(80),
    maxPoints: z.number().int().min(1).max(24).optional(),
    buildingsTitle: z.string().min(1).max(120),
    buildingFields: z.array(calcEditorFieldSchema).min(1),
    // Пустой список — валидное состояние «застройки нет» (плашка о допущении
    // приходит в `notices`).
    buildings: z.array(insolationBuildingSchema),
    addBuildingLabel: z.string().min(1).max(80),
    removeBuildingLabel: z.string().min(1).max(80),
    maxBuildings: z.number().int().min(1).max(32).optional(),
    notices: z.array(insolationNoticeSchema).min(1).optional(),
    // Подпись счётчика источников в футере («Источники значений»).
    sourcesLabel: z.string().min(1).max(80).optional(),
    submit: calcSubmitSchema,
  })
  .strict();

export type InsolationPoint = z.infer<typeof insolationPointSchema>;
export type InsolationBuilding = z.infer<typeof insolationBuildingSchema>;
export type InsolationNotice = z.infer<typeof insolationNoticeSchema>;
export type InsolationEditorProps = z.infer<typeof insolationEditorPropsSchema>;

export const insolationEditorDefinition: CatalogComponentDefinition<
  typeof insolationEditorPropsSchema
> = {
  name: 'InsolationEditor',
  slug: 'insolation-editor',
  description:
    'A single-message editor that collects the input data of a sunlight-duration (insolation, SanPiN 1.2.3685-21 / GOST R 57795) calculation: read-only conditions (region with its latitude zone, the normative hours and period), one tab per calculation point (floor, window orientation, window-centre elevation, check date) and a compact table of shading buildings shared by all points (direction, distance, height, front), all added and removed locally. Agent-computed values stay editable and keep a "calculated" provenance caption that turns into "edited by you"; warning notices spell out the simplified rectangular-screen model. No solar geometry or normative tables live in the component — they come in props — and the whole document ({conditions, points, buildings}) goes back to the agent in a single submit action.',
  schema: insolationEditorPropsSchema,
};
