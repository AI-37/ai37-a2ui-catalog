import {z} from 'zod';

/**
 * Модель чертежей Данилюка для карточки отчёта КЕО: разрез по помещению
 * (график I) и план помещения (график II) — **числами**, а не разметкой.
 *
 * Единицы фиксированы схемой: линейные размеры — метры, углы — градусы
 * (Решение 1 design.md `keo-report-drawings`). Градусы, а не радианы: числа
 * читаются глазом и совпадают с подписями на листе. Готовых строк, пикселей,
 * радиусов и SVG в модели нет — форматирует и вписывает чертёж рендерер.
 *
 * Законы графиков сюда не копируются: азимуты лучей веера графика II зависят
 * от θ и приезжают от агента массивом, веер графика I от данных не зависит и
 * живёт константой отрисовки в рендерере (Решение 2 design.md).
 */

/** Положительный линейный размер, м. */
const sizeSchema = z.number().min(0.01).max(200);

/** Высота от уровня пола, м (подоконник у пола — 0). */
const levelSchema = z.number().min(0).max(200);

/** Знаковое смещение вдоль оси, м. */
const offsetSchema = z.number().min(-200).max(200);

/** Угол возвышения над горизонтом из расчётной точки, град. */
const elevationDegSchema = z.number().min(-89.9).max(89.9);

/** Азимут от оси характерного разреза на плане, град. */
const azimuthDegSchema = z.number().min(-89.9).max(89.9);

/** Азимут луча веера графика II, град: половина веера, 0 ≤ ψ < 90. */
const rayAngleDegSchema = z.number().min(0).max(89.9);

/** Число лучей графика (n₁, n₂) — до 100 у бесконечно широкого проёма. */
const rayCountSchema = z.number().min(0).max(100);

/** Расчётная точка на разрезе: от внутренней грани оконной стены и от пола. */
export const keoDrawingPointSchema = z
  .object({
    lt: sizeSchema,
    height: levelSchema,
  })
  .strict();

/** Противостоящая застройка — только для подписи β-луча. */
export const keoDrawingOpposingSchema = z
  .object({
    /** Расстояние от наружной грани оконной стены, м. */
    distance: sizeSchema,
    /** Высота застройки от уровня пола помещения, м. */
    height: sizeSchema,
  })
  .strict();

/**
 * Разрез по помещению. Начало координат чертежа — пересечение уровня пола с
 * внутренней гранью оконной стены; помещение уходит вглубь, стена — наружу.
 */
export const keoSectionDrawingSchema = z
  .object({
    roomDepth: sizeSchema,
    roomHeight: sizeSchema,
    wallThickness: sizeSchema,
    /** Высота подоконника от пола, м. */
    sillHeight: levelSchema,
    /** Верх светопроёма от пола, м. */
    windowTop: sizeSchema,
    point: keoDrawingPointSchema,
    /** α — верх проёма из расчётной точки, град. */
    alphaDeg: elevationDegSchema,
    /** β — верх застройки из расчётной точки, град. Нет застройки — нет поля. */
    betaDeg: elevationDegSchema.optional(),
    opposing: keoDrawingOpposingSchema.optional(),
    /** Видно ли небо из расчётной точки: `false` — сектор не рисуется. */
    skyVisible: z.boolean(),
    /** n₁ по графику I; при перекрытом небе поля нет. */
    n1: rayCountSchema.optional(),
  })
  .strict();

/** Светопроём на плане: ширина и смещение центра от оси расчётной точки. */
export const keoDrawingWindowSchema = z
  .object({
    width: sizeSchema,
    offset: offsetSchema,
  })
  .strict();

/** Расчётная точка на плане: от внутренней грани оконной стены. */
export const keoDrawingPlanPointSchema = z
  .object({
    lt: sizeSchema,
  })
  .strict();

/**
 * План помещения. Ось Y — характерный разрез (вглубь помещения), начало —
 * на внутренней грани оконной стены.
 */
export const keoPlanDrawingSchema = z
  .object({
    roomWidth: sizeSchema,
    roomDepth: sizeSchema,
    wallThickness: sizeSchema,
    window: keoDrawingWindowSchema,
    point: keoDrawingPlanPointSchema,
    /** θ — верх проёма из расчётной точки в характерном разрезе, град. */
    thetaDeg: elevationDegSchema,
    /**
     * Азимуты лучей веера графика II: ψ_k, при которых K(ψ_k; θ) = k, k = 1…49
     * — одна половина веера, вторую рендерер отражает. Закон зависит от θ и
     * живёт у агента (Решение 2 design.md).
     */
    fanRayAnglesDeg: z.array(rayAngleDegSchema).min(1).max(49),
    /** Края сектора через проём, град: знак — сторона от оси разреза. */
    psi1Deg: azimuthDegSchema,
    psi2Deg: azimuthDegSchema,
    /** n₂ по графику II. */
    n2: rayCountSchema.optional(),
  })
  .strict();

/** Две проекции одного помещения — вместе, порознь чертёж не читается. */
export const keoDrawingsSchema = z
  .object({
    section: keoSectionDrawingSchema,
    plan: keoPlanDrawingSchema,
  })
  .strict();

export type KeoDrawingPoint = z.infer<typeof keoDrawingPointSchema>;
export type KeoDrawingOpposing = z.infer<typeof keoDrawingOpposingSchema>;
export type KeoSectionDrawing = z.infer<typeof keoSectionDrawingSchema>;
export type KeoDrawingWindow = z.infer<typeof keoDrawingWindowSchema>;
export type KeoDrawingPlanPoint = z.infer<typeof keoDrawingPlanPointSchema>;
export type KeoPlanDrawing = z.infer<typeof keoPlanDrawingSchema>;
export type KeoDrawings = z.infer<typeof keoDrawingsSchema>;
