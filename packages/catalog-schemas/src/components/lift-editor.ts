import {z} from 'zod';
import {constructionsFieldSourceSchema} from './constructions-editor';
import {formFieldBaseSchema} from './form-card';
import {type CatalogComponentDefinition} from '../types';

/**
 * Источник значения поля — тот же контракт, что `generalSources` теплотеха:
 * словарь словоформ у рендереров общий, поэтому видам источника расходиться
 * нельзя — схема одна на оба компонента, а не копия.
 */
export const liftEditorFieldSourceSchema = constructionsFieldSourceSchema;

// Источники по именам полей одного экрана (здания или лифта). Параллельный
// блок, а не обёртка над значениями: payload submit'а не меняется.
export const liftEditorSectionSourcesSchema = z.record(
  z.string(),
  liftEditorFieldSourceSchema,
);

// Режим лифтов методики: перечень вкладок «Лифт 1…N» с add/remove либо одна
// вкладка лифтовой группы (число лифтов в ней — обычное поле здания).
export const liftsModeSchema = z.enum(['per-lift', 'group']);

// Экран, на котором живёт поле-источник: значения лифта (по умолчанию) или
// значения здания. Тип здания на «Здании» управляет полями лифта.
export const liftEditorFieldScopeSchema = z.enum(['building', 'lift']);

/**
 * Поле редактора — базовое поле FormCard плюс аддитивные ключи. Новой
 * параллельной модели поля в каталоге не заводим (Решение 5 design.md).
 */
export const liftEditorFieldSchema = formFieldBaseSchema
  .extend({
    // `combo` — свободный ввод с подсказками ряда (datalist), значение вне
    // ряда допустимо: реальные каталоги лифтов выходят за ряды ГОСТ.
    type: z.enum(['text', 'number', 'select', 'boolean', 'lookup', 'combo']),
    // Поле с осмысленным значением по умолчанию — под экспандер.
    advanced: z.boolean().optional(),
    // Подпись поля в строке-сводке свёрнутой секции («Vн», «H₀»); без неё
    // сводка берёт `name`.
    shortLabel: z.string().min(1).max(40).optional(),
    hint: z.string().min(1).max(160).optional(),
    // Пояснение к варианту ряда («1» → «h 1.5; t123 13.5»); в submit уходит
    // само значение, не текст.
    optionNotes: z.record(z.string(), z.string()).optional(),
    // Подсказки, зависящие от значения другого поля (ряды Прил. Е разные для
    // жилых и офисов). Значение, выпавшее из нового ряда, не сбрасывается.
    optionsBy: z
      .object({
        source: z.string().min(1).max(80),
        scope: liftEditorFieldScopeSchema.optional(),
        options: z.record(z.string(), z.array(z.string()).min(1)),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Декларативное зависимое значение: при изменении любого источника ищется
 * строка, чей `when` совпал со значениями `sources` по порядку, и её `set`
 * перезаписывает поля лифта. Нормативных таблиц ГОСТ в компоненте нет —
 * приходят готовые строки (Решение 7 design.md).
 */
export const liftEditorDependentRuleSchema = z
  .object({
    sources: z
      .array(
        z
          .object({
            field: z.string().min(1).max(80),
            scope: liftEditorFieldScopeSchema.optional(),
          })
          .strict(),
      )
      .min(1)
      .max(4),
    rows: z
      .array(
        z
          .object({
            // Порядок значений = порядок `sources`.
            when: z.array(z.union([z.string(), z.number()])).min(1),
            set: z.record(z.string(), z.union([z.string(), z.number()])),
          })
          .strict(),
      )
      .min(1),
    // Нет совпадения: 'keep' — оставить как есть (свой Vn не трогает h/t123),
    // 'clear' — очистить и дать ввести вручную. Default 'keep'.
    onNoMatch: z.enum(['keep', 'clear']).optional(),
  })
  .strict();

/** Конфиг одной методики: состав экранов, режим лифтов и правила подстановок. */
export const liftEditorMethodConfigSchema = z
  .object({
    // Ключ методики в домене агента ('52941' | '34758'); компонент только сверяет строки.
    method: z.string().min(1).max(40),
    label: z.string().min(1).max(120),
    // Подзаголовок экрана; логики за ним нет.
    gostLabel: z.string().min(1).max(60),
    buildingTitle: z.string().min(1).max(120),
    buildingFields: z.array(liftEditorFieldSchema).min(1),
    liftTitle: z.string().min(1).max(120),
    liftFields: z.array(liftEditorFieldSchema).min(1),
    liftsMode: liftsModeSchema,
    // 'Лифт' → «Лифт 1»; в режиме группы — подпись единственной секции.
    liftTabLabel: z.string().min(1).max(80),
    // Тип здания для текста шапки «gostLabel · тип», когда у ветки нет поля
    // `buildingType` («жилое здание» для 52941).
    buildingKindLabel: z.string().min(1).max(80).optional(),
    maxLifts: z.number().int().min(1).max(16).optional(),
    dependentRules: z.array(liftEditorDependentRuleSchema).max(8).optional(),
  })
  .strict();

export const liftEditorPropsSchema = z
  .object({
    // Управляет активным конфигом, поэтому отдельный проп, а не первое поле
    // `buildingFields` (Решение 3 design.md). Рендерится первым на «Здании».
    methodField: liftEditorFieldSchema,
    // Конфиги ВСЕХ методик сразу — смена методики локальна, без раунд-трипа.
    methodConfigs: z.array(liftEditorMethodConfigSchema).min(1),
    method: z.string().min(1).max(40),
    // Значения активной ветки; черновики остальных живут только на клиенте.
    building: z.record(z.string(), z.unknown()),
    lifts: z.array(z.record(z.string(), z.unknown())),
    buildingTabLabel: z.string().min(1).max(80),
    advancedLabel: z.string().min(1).max(80),
    addLabel: z.string().min(1).max(80),
    removeLabel: z.string().min(1).max(80),
    submitLabel: z.string().min(1).max(80),
    // Единственный action компонента (Решение 10 design.md).
    submitAction: z.string().min(1).max(120),
    // Имя action'а автосохранения черновика. Необязательный: без него компонент
    // ведёт себя как раньше — наружу уходит только submit.
    draftAction: z.string().min(1).max(120).optional(),
    // Шапка карточки: заголовок слева, контекст и переключатель методики
    // справа. Без `headerTitle` шапки нет — переключатель падает над секции.
    headerTitle: z.string().min(1).max(120).optional(),
    headerContext: z.string().min(1).max(200).optional(),
    // Подпись кнопки-навигации «Далее»: пока есть незаполненные обязательные
    // поля или непросмотренные секции, кнопка ведёт по секциям и не шлёт
    // действий. Без пропа кнопка блокируется, как раньше.
    pendingLabel: z.string().min(1).max(80).optional(),
    // Источники значений полей — только подписи под контролами; ничего не
    // блокируют и в payload не уходят. `liftSources` — по индексам лифтов.
    buildingSources: liftEditorSectionSourcesSchema.optional(),
    liftSources: z.array(liftEditorSectionSourcesSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (!value.methodConfigs.some(config => config.method === value.method)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `methodConfigs has no config for method "${value.method}"`,
        path: ['method'],
      });
    }

    if (value.methodField.type !== 'select') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'methodField.type must be "select"',
        path: ['methodField', 'type'],
      });
    }

    for (const [configIndex, config] of value.methodConfigs.entries()) {
      for (const [ruleIndex, rule] of (config.dependentRules ?? []).entries()) {
        for (const [rowIndex, row] of rule.rows.entries()) {
          if (row.when.length !== rule.sources.length) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Row "when" has ${row.when.length} value(s) but the rule declares ${rule.sources.length} source(s).`,
              path: [
                'methodConfigs',
                configIndex,
                'dependentRules',
                ruleIndex,
                'rows',
                rowIndex,
                'when',
              ],
            });
          }
        }
      }
    }
  });

export type LiftsMode = z.infer<typeof liftsModeSchema>;
export type LiftEditorFieldSource = z.infer<typeof liftEditorFieldSourceSchema>;
export type LiftEditorSectionSources = z.infer<typeof liftEditorSectionSourcesSchema>;
export type LiftEditorFieldScope = z.infer<typeof liftEditorFieldScopeSchema>;
export type LiftEditorField = z.infer<typeof liftEditorFieldSchema>;
export type LiftEditorDependentRule = z.infer<typeof liftEditorDependentRuleSchema>;
export type LiftEditorMethodConfig = z.infer<typeof liftEditorMethodConfigSchema>;
export type LiftEditorProps = z.infer<typeof liftEditorPropsSchema>;

export const liftEditorDefinition: CatalogComponentDefinition<typeof liftEditorPropsSchema> = {
  name: 'LiftEditor',
  slug: 'lift-editor',
  description:
    'A single-screen editor for a lift (elevator) calculation document: a card header with the calculation-method switcher ("GOST · building kind"), a collapsible building section on top and lift sections below it (or a single lift-group section, depending on the method). Collapsed sections show a live summary line built from current values; a two-mode footer button navigates to the next incomplete/unreviewed section ("Next") and turns into submit once the document has been walked through. Everything happens on the client — every method config, option row and derived-value table is preloaded in props — and the whole document ({method, building, lifts}) goes back to the agent in a single action. Optional provenance blocks (buildingSources/liftSources) caption fields with where their values came from; edits are auto-saved as debounced drafts when draftAction is set. Fields support free text entry with normative-row hints (combo), option lists driven by another field, declarative dependent values, and a collapsible summarised group for defaulted parameters.',
  schema: liftEditorPropsSchema,
};

/**
 * Тот же экран подбора лифтов на новом наборе примитивов
 * (`packages/catalog-react/src/primitives`, интерактивность — `@base-ui/react`).
 * Схема props общая с `liftEditorDefinition` намеренно: сравнивать «было /
 * стало» на разном наполнении бессмысленно, поэтому новое имя нужно только
 * компоненту, не данным. Оба рендерера зарегистрированы одновременно — агент
 * может адресовать любой.
 */
export const liftEditorNextDefinition: CatalogComponentDefinition<typeof liftEditorPropsSchema> = {
  name: 'LiftEditorNext',
  slug: 'lift-editor-next',
  description:
    'The same lift (elevator) calculation editor as `LiftEditor` — identical props, identical data contract, both calculation methods with the same client-side form rebuild — rendered on the catalog primitive set (cards, buttons, chips, one type scale, tokenised colours) with interaction taken from a headless component library: accordion sections that open with Enter/Space and expose aria-expanded/aria-controls, dropdowns, number fields with arrow-key stepping, and free-text fields with a normative-row hint list. Prefer it when the surface should be navigable without a mouse; emit the same props as for `LiftEditor`.',
  schema: liftEditorPropsSchema,
};
