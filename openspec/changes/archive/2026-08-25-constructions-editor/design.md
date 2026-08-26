## Context

Каталог сегодня: FormCard — плоский статичный список полей, батчит значения и
шлёт один action на submit; lookup-поле с двумя каналами подсказок (action и
fetch); SimpleTable/FlexTable — только отображение. Компонентов со списками
переменной длины, аккордеоном и вычисляемой обратной связью нет. Базовый
движок (`@a2ui/web_core`) ограничений не накладывает: компонент волен держать
произвольный локальный state и отдать вложенный payload одним
`dispatchAction`. Прецедент процесса — `form-card-lookup-field` (схема →
рендерер → python → фикстуры → тесты → export:public).

Потребитель-заказчик — агент teplo-calc (связанный change
`constructions-editor-screen`): конструкции СП 50 со слоями, live Rпр против
Rнорм, lookup материалов прил. М.

## Goals / Non-Goals

**Goals:**

- Редактирование вложенной структуры (конструкции → слои) целиком на
  клиенте: add/remove строк и карточек, lookup материалов, live Rпр — без
  единого AG-UI-run до submit.
- Один submit: полный массив конструкций в `context` одного action'а.
- Ноль регрессии FormCard/lookup (рефактор — только вынос хука).

**Non-Goals:**

- Generic repeating-group как тип поля FormCard (отдельная большая тема).
- dataModel/path-биндинг полей редактора (паттерн FormCard: self-contained).
- Нормативные таблицы СП 50 на клиенте (Rнорм/α приходят числами в props).
- Точный Rs воздушных зазоров в live-превью (канон — на сервере).
- Персист незасабмиченных правок при перезагрузке страницы.

## Decisions

### Решение 1 — self-contained state, не dataModel

Рабочая копия конструкций — `React.useState`, засеянный из
`props.constructions`; open/closed карточек — тоже локально. Паттерн FormCard
(значения в компоненте, наружу — только submit). Альтернатива — двусторонний
биндинг через dataModel (`Dynamic*` + GenericBinder): даёт реактивность на
`updateDataModel` от агента, но тянет конвенции путей и не нужна — агент
между submit'ами в состояние редактора не пишет.

### Решение 2 — схема props (эскиз)

```ts
layerKind = z.enum(['material', 'vent-gap', 'closed-gap']);

constructionLayer = z.object({
  material: z.string().min(1).max(200),
  thicknessMm: z.number().positive().nullable(), // null — незаполненная строка
  kind: layerKind.optional(),
  materialKey: z.string().optional(),      // выбран из справочника
  lambdaA: z.number().positive().optional(),
  lambdaB: z.number().positive().optional(),
  lambdaManual: z.number().positive().optional(), // материал вне прил. М
}).strict();

constructionType = z.enum([
  'steny', 'pokrytiya', 'cherdachnye_podval_grunt', 'okna', 'fonari', 'dver',
]);
cherdachnyeSubtype = z.enum([
  'cherdak', 'podval_vent', 'podval_nevent', 'pol_po_gruntu',
]);

constructionEntry = z.object({
  id: z.string().min(1),                   // ключ React-списка, клиентский
  type: constructionType,
  subtype: cherdachnyeSubtype.optional(),
  name: z.string().max(200).optional(),
  layers: z.array(constructionLayer).max(50),
  rprPassport: z.number().positive().optional(), // окна/фонари/двери
}).strict();

constructionTypeConfig = z.object({
  type: constructionType,
  label: z.string(),
  hasLayers: z.boolean(),
  rnorm: z.number().positive().optional(), // нет → чип «—», сравнения нет
  alphaV: z.number().positive().optional(),
  alphaN: z.union([
    z.number().positive(),
    z.record(cherdachnyeSubtype, z.number().positive()), // pol_po_gruntu отсутствует
  ]).optional(),
}).strict();

constructionsEditorProps = z.object({
  constructions: z.array(constructionEntry),
  typeConfigs: z.array(constructionTypeConfig).min(1),
  condition: z.enum(['А', 'Б']).optional(),  // выбор λА/λБ; нет → λБ
  materialsReferenceId: z.string().min(1).max(80),
  minChars: z.number().int().min(1).max(10).optional(),
  addLabel: z.string().min(1).max(80),
  submitLabel: z.string().min(1).max(80),
  submitAction: z.string().min(1).max(120),
  backLabel: z.string().min(1).max(80),
  backAction: z.string().min(1).max(120),
  backActionContext: z.record(z.string(), z.unknown()).optional(),
}).strict();
```

Нормативка — на агенте: компонент не знает табл. 3/ГСОП, только готовые
`rnorm`/`alphaV`/`alphaN`. Имена action'ов — в props (компонент
домен-нейтрален к именам, teplo передаст `constructions:apply` и `navigate`).

### Решение 3 — lookup в строке: вынос хука, реюз fetch-канала

Fetch/debounce/AbortController из `LookupFieldFetchControl`
(`lookup-field-fetch.tsx`) выносится в хук `use-lookup-suggest.ts`;
контрол становится тонкой обёрткой (поведение FormCard не меняется — нулевая
регрессия), строка слоя рендерит `LookupCombobox` + хук с
`props.materialsReferenceId`. Канал — существующий same-origin GET
`LOOKUP_SUGGEST_ROUTE?referenceId&query`: ни одного AG-UI-run, `messageId`/
dataModel не участвуют. Action-канал (`lookup:suggest` + dataModel-путь с
`fieldName`) сознательно не используется: потребовал бы схему имён полей
per-row и run на каждую подсказку.

Опция подсказки может нести доп. поля `lambdaA`/`lambdaB` — контракт ответа
уже `LookupOption & Record<string, unknown>`
(`form-card-lookup-fetch.types.ts`), `parseLookupOptions` доп. поля
пропускает. Выбор опции заполняет `materialKey`/`lambdaA`/`lambdaB` строки;
опция без λ (зазор, «как есть») переключает строку на ручной ввод
`lambdaManual`.

### Решение 4 — live Rпр: формула и спец-кейсы

`Rпр = 1/alphaV + 1/alphaN + Σ (thicknessMm/1000) / λ`, где λ строки:
`lambdaManual` ?? (condition === 'А' ? lambdaA : lambdaB) ?? lambdaB.
Дефолт «Б с запасом» ОБЯЗАН совпадать с серверным `resolve-layer-lambda`
teplo-calc — расхождение live-цифры с канонической подрывает доверие
(общая тест-фикстура, см. tasks). Спец-кейсы:

- `alphaN` — record, subtype без записи (`pol_po_gruntu`) → член `1/αн`
  опускается **именно как спец-кейс** (не «нет значения → 0»);
- строки-зазоры (`kind !== 'material'`): слагаемое δ/λ в live-превью
  опускается с подсказкой «Rs — в итоговом расчёте» (канон на сервере);
- `rnorm` отсутствует → чип сравнения не рендерится;
- типы `hasLayers: false` → вместо таблицы одно поле `rprPassport`,
  чип сравнивает его с `rnorm`.

### Решение 5 — клиентская валидация до dispatch

Submit блокируется с подсветкой строк при: пустом материале, `thicknessMm`
null/≤0 у слоя, отсутствии `lambdaManual` у строки без λ из справочника,
пустом `rprPassport` у типа без слоёв. Серверная батч-валидация у агента
остаётся страховкой (replay/tamper), но нормальный путь ошибок — мгновенный,
без раунд-трипа. Кнопка back валидацией не блокируется.

### Решение 6 — один submit-action

`dispatchAction({event: {name: props.submitAction, context:
{constructions: <текущий массив>}}})` — включая `id` (агент их игнорирует) и
незасабмиченные λ-поля; никаких промежуточных action'ов компонент не шлёт.
Back — `dispatchAction({event: {name: props.backAction, context:
props.backActionContext ?? {}}})`.

## Risks / Trade-offs

- [Дрейф λ-дефолта клиент/сервер] → фиксация «нет condition → λБ» в спеке +
  синхронная фикстура с тестами teplo-calc.
- [4 точки регистрации (componentDefinitions, CATALOG_COMPONENT_NAMES,
  customComponents, python `__init__`) — легко забыть одну] → чек в tasks +
  превью в demo-app ловит «unknown component» сразу.
- [Крупный рендерер] → разбивка на подфайлы (карточка, строка слоя), хуки
  выносятся; лимиты схемы (`max(50)` слоёв) страхуют от патологий.
- [Рефактор lookup-field-fetch] → контрол остаётся обёрткой над хуком,
  существующие тесты FormCard-lookup не меняются и должны остаться зелёными.

## Open Questions

- Нет (UX-решения зафиксированы макетом; спорное — кнопка «Справочники» —
  вопрос агентского change, не каталога).
