import {z} from 'zod';
import {
  calcConditionSchema,
  calcEditorFieldSchema,
  calcFieldSourcesSchema,
  calcSubmitSchema,
} from './calc-editor-common';
import {type CatalogComponentDefinition} from '../types';

/**
 * Секция помещения: назначение, геометрия, светопроём, затенение, умолчания.
 * `advanced` — экспандер «Коэффициенты приняты по умолчанию»: секция свёрнута,
 * в свёрнутом виде показывает сводку принятых значений.
 */
export const keoEditorSectionSchema = z
  .object({
    key: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    advanced: z.boolean().optional(),
    fields: z.array(calcEditorFieldSchema).min(1),
  })
  .strict();

/** Значения одного помещения плюс источники этих значений (только подписи). */
export const keoEditorRoomSchema = z
  .object({
    // Без имени вкладка подписывается как «{roomLabel} {номер}».
    name: z.string().min(1).max(120).optional(),
    values: z.record(z.string(), z.unknown()),
    sources: calcFieldSourcesSchema.optional(),
  })
  .strict();

/**
 * Готовые строки для одного назначения помещения: плоскость расчёта и
 * положение расчётной точки. `byApartment` уточняет точку по комнатности
 * квартиры (СП 52 п. 5.3), `point` — общий вариант, когда комнатность не
 * влияет (кухня).
 */
export const keoComputedNoteEntrySchema = z
  .object({
    plane: z.string().min(1).max(200),
    point: z.string().min(1).max(200).optional(),
    byApartment: z.record(z.string(), z.string()).optional(),
  })
  .strict();

/**
 * Вычисляемая подпись вместо редактируемого поля «рабочая плоскость»: клиент
 * выбирает готовую строку по текущим значениям назначения и комнатности и
 * пересчитывает её при их смене. Нормативных таблиц в компоненте нет — он
 * знает только «ключ → строка» (прецедент `dependentRules` LiftEditor).
 */
export const keoComputedNotesSchema = z
  .object({
    label: z.string().min(1).max(120),
    purposeField: z.string().min(1).max(80),
    apartmentField: z.string().min(1).max(80).optional(),
    byPurpose: z.record(z.string(), keoComputedNoteEntrySchema),
  })
  .strict();

/**
 * Предупреждающее правило геометрии. Параметры и текст — от агента, клиент
 * только считает и подсвечивает (канон CE «! проверить»); submit не блокируется.
 *
 * `ratio-max`: сумма `over` / сумма `under` ≤ `limit` (d_п/h₀₁ ≤ 2,5,
 * СП 367 п. 9.1.1 — определение h₀₁ задаёт агент составом `under`).
 * `sum-max`: сумма `over` ≤ `limit` либо ≤ значения `limitField`
 * (h_пд + h_o ≤ высоты помещения; количество окон ≤ 1 в супер-MVP).
 */
export const keoValidationRuleSchema = z
  .object({
    kind: z.enum(['ratio-max', 'sum-max']),
    over: z.array(z.string().min(1).max(80)).min(1),
    under: z.array(z.string().min(1).max(80)).min(1).optional(),
    limit: z.number().optional(),
    limitField: z.string().min(1).max(80).optional(),
    message: z.string().min(1).max(300),
    // Поля, которые подсвечиваются пометкой «! проверить» при нарушении.
    targets: z.array(z.string().min(1).max(80)).min(1),
  })
  .strict();

/**
 * Сбор исходных данных расчёта КЕО одним сообщением: readonly-условия, N
 * помещений вкладками с локальным добавлением и удалением, один submit с
 * полным документом `{conditions, rooms}`. Нормативных справочников (e_н, C_N,
 * τ, MF, ρ) в компоненте нет — все значения и подсказки приходят готовыми.
 */
export const keoEditorPropsSchema = z
  .object({
    title: z.string().min(1).max(120),
    // Строка проекта/норматива под заголовком.
    meta: z.string().min(1).max(200).optional(),
    conditions: z.array(calcConditionSchema).min(1),
    roomTemplate: z
      .object({
        sections: z.array(keoEditorSectionSchema).min(1),
      })
      .strict(),
    rooms: z.array(keoEditorRoomSchema).min(1),
    // «Помещение» — основа подписи вкладки и кнопок.
    roomLabel: z.string().min(1).max(80),
    addRoomLabel: z.string().min(1).max(80),
    removeRoomLabel: z.string().min(1).max(80),
    maxRooms: z.number().int().min(1).max(24).optional(),
    computedNotes: keoComputedNotesSchema.optional(),
    validationRules: z.array(keoValidationRuleSchema).max(8).optional(),
    // Подпись счётчика источников в футере («Источники значений»).
    sourcesLabel: z.string().min(1).max(80).optional(),
    // Подпись первого режима кнопки подвала («Далее»). Пока по документу есть
    // незаполненные или непросмотренные секции, кнопка ведёт по ним, а не
    // отправляет. Без подписи режима прохода нет вовсе: кнопка одна — та, что
    // отправляет (прецедент `pendingLabel` у `LiftEditor`).
    nextLabel: z.string().min(1).max(80).optional(),
    // Заголовок группы условий («Условия»). Без него группа стоит первым
    // блоком без раскрывашки и заголовка: русских слов компонент не сочиняет.
    conditionsLabel: z.string().min(1).max(120).optional(),
    // Имя action'а автосохранения черновика. Необязательный: без него компонент
    // ведёт себя как раньше — наружу уходит только submit. Ключ тот же и с той
    // же оговоркой, что у `ConstructionsEditor` и `LiftEditor`: агент, который
    // черновик хранить не умеет, просто не присылает его.
    draftAction: z.string().min(1).max(120).optional(),
    // СПАЙК keo-draft-rest-channel: относительный URL приёма черновика REST'ом
    // (цепочка /api/agent-resource, как downloadUrl протокола). Задан — черновик
    // уезжает POST'ом туда, вне диалогового run'а, и рендерер применяет `notes`
    // ответа локально; `draftAction` при этом остаётся путём отката для старых
    // клиентов. Относительный путь — такой проходит санитайзер хоста.
    draftUrl: z.string().min(1).max(500).optional(),
    submit: calcSubmitSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    const fieldNames = new Set(
      value.roomTemplate.sections.flatMap(section => section.fields.map(field => field.name)),
    );

    for (const [sectionIndex, section] of value.roomTemplate.sections.entries()) {
      for (const [fieldIndex, field] of section.fields.entries()) {
        if (field.revealBy && !fieldNames.has(field.revealBy.field)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `revealBy references unknown field "${field.revealBy.field}"`,
            path: ['roomTemplate', 'sections', sectionIndex, 'fields', fieldIndex, 'revealBy'],
          });
        }
      }
    }

    if (value.computedNotes && !fieldNames.has(value.computedNotes.purposeField)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `computedNotes.purposeField references unknown field "${value.computedNotes.purposeField}"`,
        path: ['computedNotes', 'purposeField'],
      });
    }

    for (const [index, rule] of (value.validationRules ?? []).entries()) {
      if (rule.kind === 'ratio-max' && (rule.under === undefined || rule.limit === undefined)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ratio-max rule requires both "under" and "limit"',
          path: ['validationRules', index],
        });
      }

      if (rule.kind === 'sum-max' && rule.limit === undefined && rule.limitField === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'sum-max rule requires "limit" or "limitField"',
          path: ['validationRules', index],
        });
      }
    }
  });

export type KeoEditorSection = z.infer<typeof keoEditorSectionSchema>;
export type KeoEditorRoom = z.infer<typeof keoEditorRoomSchema>;
export type KeoComputedNoteEntry = z.infer<typeof keoComputedNoteEntrySchema>;
export type KeoComputedNotes = z.infer<typeof keoComputedNotesSchema>;
export type KeoValidationRule = z.infer<typeof keoValidationRuleSchema>;
export type KeoEditorProps = z.infer<typeof keoEditorPropsSchema>;

export const keoEditorDefinition: CatalogComponentDefinition<typeof keoEditorPropsSchema> = {
  name: 'KeoEditor',
  slug: 'keo-editor',
  description:
    'A single-message editor that collects the input data of a daylight-factor (KEO, SP 367.1325800) calculation: read-only project conditions on top, then one tab per room ("Room 1…N", add and remove locally) with sections for purpose, geometry, the window opening, opposing-building shading (revealed by a trigger field) and a collapsed group of defaulted coefficients. Every value carries a provenance caption (from the project / from your question / suggested / calculated / assumption) and the footer counts them; the calculation plane and reference-point captions are computed on the client from ready-made strings, and parameterised rules highlight suspicious geometry with a non-blocking "check this" mark. No normative tables live in the component — they come in props — and the whole document ({conditions, rooms}) goes back to the agent in a single submit action.',
  schema: keoEditorPropsSchema,
};

/**
 * Тот же экран на примитивах каталога. Схема props общая со старым рендерером
 * намеренно (Решение 2 change'а `keo-editor-next`): одно наполнение обязано
 * рендериться обоими, иначе сравнивать «было / стало» нечем, а агенту не
 * приходится знать, какой рендерер стоит у потребителя.
 */
export const keoEditorNextDefinition: CatalogComponentDefinition<typeof keoEditorPropsSchema> = {
  name: 'KeoEditorNext',
  slug: 'keo-editor-next',
  description:
    'The same daylight-factor (KEO, SP 367.1325800) input editor as `KeoEditor` — identical props, identical data contract, the same single submit with the whole {conditions, rooms} document — rendered on the catalog primitive set (cards, buttons, chips, one type scale, tokenised colours) with interaction taken from a headless component library. Rooms are collapsible sections instead of tabs, so a second room is visible as a summarised row rather than hidden behind a switch; each room holds its own collapsible sections (purpose, geometry, opening, shading), dropdowns and number fields step with the keyboard, and the project city is a reference lookup that can be corrected for the calculation only. Set `conditionsLabel` to put the conditions into a titled collapsible group, and `nextLabel` to turn the footer button into a two-mode walkthrough ("Next" until every section has been visited, then submit); omit them and the conditions stand as a plain first block and the footer has the submit button alone. Prefer it when the surface should be navigable without a mouse or when the document has more than one room; emit the same props as for `KeoEditor`.',
  schema: keoEditorPropsSchema,
};
