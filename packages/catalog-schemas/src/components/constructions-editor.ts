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

// Город из справочника: ключ опции lookup'а и её подпись.
export const constructionsCitySchema = z
  .object({
    value: z.string().min(1).max(200),
    label: z.string().min(1).max(200),
  })
  .strict();

// Общие данные вкладки «Общие данные» — климат (СП 131) и здание. Ключи
// присутствуют всегда, незаполненное значение — null: поля приходят от агента
// и правятся на клиенте, как конструкции.
export const constructionsGeneralSchema = z
  .object({
    buildingType: z.string().max(200).nullable(),
    city: constructionsCitySchema.nullable(),
    // tот — средняя температура отопительного периода, °C (бывает < 0).
    tot: z.number().nullable(),
    // zот — продолжительность отопительного периода, сут.
    zot: z.number().nullable(),
    // tн — температура наиболее холодной пятидневки, °C.
    tn: z.number().nullable(),
    // tв — расчётная температура внутреннего воздуха, °C.
    tv: z.number().nullable(),
    // Условие эксплуатации А/Б — выбор λА/λБ; null → λБ (как на сервере).
    condition: z.enum(['А', 'Б']).nullable(),
  })
  .strict();

export const constructionsEditorPropsSchema = z
  .object({
    constructions: z.array(constructionEntrySchema),
    typeConfigs: z.array(constructionTypeConfigSchema).min(1),
    // Общие данные первой вкладки. Без пропа вкладок нет: компонент работает
    // как прежде — один экран конструкций и submit с `{constructions}`.
    general: constructionsGeneralSchema.optional(),
    buildingTypeOptions: z.array(z.string().min(1).max(200)).max(50).optional(),
    // Справочник городов для lookup'а; опция может нести tot/zot/tn.
    cityReferenceId: z.string().min(1).max(80).optional(),
    generalTabLabel: z.string().min(1).max(80).optional(),
    constructionsTabLabel: z.string().min(1).max(80).optional(),
    /** @deprecated начальное значение `general.condition`; правится во вкладке. */
    condition: z.enum(['А', 'Б']).optional(),
    materialsReferenceId: z.string().min(1).max(80),
    minChars: z.number().int().min(1).max(10).optional(),
    addLabel: z.string().min(1).max(80),
    submitLabel: z.string().min(1).max(80),
    submitAction: z.string().min(1).max(120),
    // Кнопка возврата опциональна: на объединённом экране её нет, у прежних
    // эмитентов поведение не меняется.
    backLabel: z.string().min(1).max(80).optional(),
    backAction: z.string().min(1).max(120).optional(),
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
export type ConstructionsCity = z.infer<typeof constructionsCitySchema>;
export type ConstructionsGeneral = z.infer<typeof constructionsGeneralSchema>;
export type ConstructionsEditorProps = z.infer<typeof constructionsEditorPropsSchema>;

export const constructionsEditorDefinition: CatalogComponentDefinition<
  typeof constructionsEditorPropsSchema
> = {
  name: 'ConstructionsEditor',
  slug: 'constructions-editor',
  description:
    'A whole-screen editor for building envelope constructions (walls, roofs, floors, windows) with variable-length layer tables, optionally paired with a general-data tab for climate and building inputs. The user edits both tabs entirely on the client — add/remove rows and cards, per-row material lookup with reference-backed autocomplete, city lookup that fills climate values, live reduced thermal resistance (R) feedback against the normative value — and submits the whole state back to the agent in a single action, without client-side blocking.',
  schema: constructionsEditorPropsSchema,
};
