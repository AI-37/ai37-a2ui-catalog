import {z} from 'zod';

/**
 * Контракт блока подбора конфигураций лифтов (change
 * `lift-editor-recommend-block`).
 *
 * Данные компонент забирает **сам**, побочным каналом
 * `GET {AGENT_RESOURCE_ROUTE}?resource=…`: отдать список ходом диалога нельзя —
 * `calc:draft` намеренно «немой», и ответный снапшот пересеял бы локальное
 * состояние формы (раскрытую секцию и набираемое значение). Тот же канал уже
 * носит подсказки lookup-поля и «Скачать» протокола.
 *
 * Владелец типов ответа — этот пакет: агент импортирует
 * `RecommendResourceVariant` отсюда, а не зеркалит форму руками.
 */

/**
 * Same-origin путь обобщённой ручки ресурсов оркестратора — одна на все
 * downstream-чтения каталога. Живёт в одном месте: `LOOKUP_SUGGEST_ROUTE`
 * ссылается на неё же.
 */
export const AGENT_RESOURCE_ROUTE = '/api/agent-resource';

/** Пауза перед запросом подбора: правка N/A не должна дёргать сеть посимвольно. */
export const RECOMMEND_DEBOUNCE_MS = 300;

/**
 * Поле, значение которого уходит в query подбора. `scope` — с какого экрана
 * его брать (`building` по умолчанию, `lift` — из первой лифтовой секции).
 * `required` — без него запрос не уходит вовсе: блока нет, пока здание не
 * заполнено.
 */
export const liftEditorRecommendParamSchema = z
  .object({
    name: z.string().min(1).max(80),
    scope: z.enum(['building', 'lift']).optional(),
    required: z.boolean().optional(),
  })
  .strict();

/**
 * Проп блока. Какие поля уходят в query — декларативно списком, а не зашито:
 * состав параметров у методик разный, и компонент про ГОСТ ничего не знает.
 */
export const liftEditorRecommendSchema = z
  .object({
    /** Id ресурса в реестре оркестратора (`lift-recommend`). */
    resource: z.string().min(1).max(120),
    /** Задача агента, если ручке нужен контекст расчёта. */
    taskId: z.string().min(1).max(200).optional(),
    params: z.array(liftEditorRecommendParamSchema).min(1).max(24),
    title: z.string().min(1).max(120),
    /** Подпись кнопки карточки; у списка выбора кнопки нет (design.md, Решение 10). */
    applyLabel: z.string().min(1).max(80),
    loadingLabel: z.string().min(1).max(120),
    emptyLabel: z.string().min(1).max(200),
    /** Сколько вариантов показать карточками. Остальные не показываются вовсе. */
    topCount: z.number().int().min(1).max(4).optional(),
  })
  .strict();

/** Значение поля формы в query и в применяемом варианте. */
const recommendValueSchema = z.union([z.string(), z.number()]);

/**
 * Вариант подбора: отдельно показ, отдельно применение. Всё, что видно
 * глазом, приходит готовыми строками — форматирование чисел, единицы и
 * словоформы комфортности остаются знанием агента.
 *
 * `apply.count` — сколько лифтовых секций должно получиться; `apply.values` —
 * значения полей лифта; `apply.buildingValues` — то, что вариант меняет в
 * «Здании» (число лифтов группы в режиме `group`).
 *
 * Схема терпима к лишним ключам (`passthrough`): ручка агента вправе
 * дописывать служебные поля, и версия каталога не должна ронять из-за них
 * весь список.
 */
export const recommendResourceVariantSchema = z
  .object({
    id: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(200).optional(),
    notes: z.array(z.string().min(1).max(160)).max(8).optional(),
    /** `ok` — прошёл норму, `near` — близ-промах. */
    tone: z.enum(['ok', 'near']).optional(),
    apply: z
      .object({
        count: z.number().int().min(1).max(16),
        values: z.record(z.string(), recommendValueSchema),
        buildingValues: z.record(z.string(), recommendValueSchema).optional(),
      })
      .passthrough(),
  })
  .passthrough();

/**
 * Ответ ручки подбора. `echo` — как ручка поняла query: страховка от показа
 * ответа на устаревший ввод. `variants` объявлен массивом `unknown` намеренно —
 * один кривой вариант не должен уносить весь список, поэтому разбор
 * поэлементный (`parseRecommendVariants` в рендерере).
 */
export const recommendResourceResponseSchema = z
  .object({
    echo: z.record(z.string(), recommendValueSchema).optional(),
    variants: z.array(z.unknown()),
  })
  .passthrough();

export type LiftEditorRecommendParam = z.infer<typeof liftEditorRecommendParamSchema>;
export type LiftEditorRecommend = z.infer<typeof liftEditorRecommendSchema>;
export type RecommendResourceVariant = z.infer<typeof recommendResourceVariantSchema>;
export type RecommendResourceResponse = z.infer<typeof recommendResourceResponseSchema>;

/** Значения, применяемые вариантом: имена доменные, компонент в них не смотрит. */
export type RecommendResourceValues = RecommendResourceVariant['apply']['values'];
