import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

// Вид строки слоя: материал (участвует в Σ δ/λ) или воздушный зазор —
// вентилируемый/невентилируемый (в live-Rпр слагаемое опускается, канонический
// Rs считает сервер).
export const constructionLayerKindSchema = z.enum(['material', 'vent-gap', 'closed-gap']);

export const constructionLayerSchema = z
  .object({
    material: z.string().min(1).max(200),
    // null — незаполненная строка (черновик до submit).
    thicknessMm: z.number().positive().nullable(),
    kind: constructionLayerKindSchema.optional(),
    // Выбран из справочника (прил. М) — ключ материала у агента.
    materialKey: z.string().optional(),
    lambdaA: z.number().positive().optional(),
    lambdaB: z.number().positive().optional(),
    // Материал вне справочника — λ вводится вручную.
    lambdaManual: z.number().positive().optional(),
  })
  .strict();

export const constructionTypeSchema = z.enum([
  'steny',
  'pokrytiya',
  'cherdachnye_podval_grunt',
  'okna',
  'fonari',
  'dver',
]);

export const cherdachnyeSubtypeSchema = z.enum([
  'cherdak',
  'podval_vent',
  'podval_nevent',
  'pol_po_gruntu',
]);

export const constructionEntrySchema = z
  .object({
    // Ключ React-списка; клиентский, агент его игнорирует.
    id: z.string().min(1),
    type: constructionTypeSchema,
    subtype: cherdachnyeSubtypeSchema.optional(),
    name: z.string().max(200).optional(),
    layers: z.array(constructionLayerSchema).max(50),
    // Типы без слоёв (окна/фонари/двери): паспортное Rпр вместо таблицы.
    rprPassport: z.number().positive().optional(),
  })
  .strict();

export const constructionTypeConfigSchema = z
  .object({
    type: constructionTypeSchema,
    label: z.string(),
    hasLayers: z.boolean(),
    // Нет rnorm → чип сравнения не показывается.
    rnorm: z.number().positive().optional(),
    alphaV: z.number().positive().optional(),
    // Число или record по subtype; subtype без записи (pol_po_gruntu) —
    // член 1/αн в Rпр опускается.
    alphaN: z
      .union([
        z.number().positive(),
        z.record(cherdachnyeSubtypeSchema, z.number().positive()),
      ])
      .optional(),
  })
  .strict();

export const constructionsEditorPropsSchema = z
  .object({
    constructions: z.array(constructionEntrySchema),
    typeConfigs: z.array(constructionTypeConfigSchema).min(1),
    // Условие эксплуатации А/Б — выбор λА/λБ; нет → λБ (синхронно с сервером).
    condition: z.enum(['А', 'Б']).optional(),
    materialsReferenceId: z.string().min(1).max(80),
    minChars: z.number().int().min(1).max(10).optional(),
    addLabel: z.string().min(1).max(80),
    submitLabel: z.string().min(1).max(80),
    submitAction: z.string().min(1).max(120),
    backLabel: z.string().min(1).max(80),
    backAction: z.string().min(1).max(120),
    backActionContext: z.record(z.string(), z.unknown()).optional(),
    // Имя action'а автосохранения черновика. Необязательный: без него
    // компонент ведёт себя как раньше — наружу уходят только submit и back.
    draftAction: z.string().min(1).max(120).optional(),
  })
  .strict();

export type ConstructionLayerKind = z.infer<typeof constructionLayerKindSchema>;
export type ConstructionLayer = z.infer<typeof constructionLayerSchema>;
export type ConstructionType = z.infer<typeof constructionTypeSchema>;
export type CherdachnyeSubtype = z.infer<typeof cherdachnyeSubtypeSchema>;
export type ConstructionEntry = z.infer<typeof constructionEntrySchema>;
export type ConstructionTypeConfig = z.infer<typeof constructionTypeConfigSchema>;
export type ConstructionsEditorProps = z.infer<typeof constructionsEditorPropsSchema>;

export const constructionsEditorDefinition: CatalogComponentDefinition<
  typeof constructionsEditorPropsSchema
> = {
  name: 'ConstructionsEditor',
  slug: 'constructions-editor',
  description:
    'A whole-screen editor for building envelope constructions (walls, roofs, floors, windows) with variable-length layer tables. The user edits construction cards and material layers entirely on the client — add/remove rows and cards, per-row material lookup with reference-backed autocomplete, live reduced thermal resistance (R) feedback against the normative value — and submits the full array back to the agent in a single action.',
  schema: constructionsEditorPropsSchema,
};
