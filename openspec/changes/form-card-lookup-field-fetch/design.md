# Design — FormCard lookup-поле через fetch (вариант 1)

## Топология (проверено по коду)

`@ai37/agent-host` монтирует в одном Express-процессе AG-UI (`/agui`,
`aguiRouter`) и REST (`/api/projects/`, `/api/threads/`, …). BFF
потребителя (`spai-ui`, `proxyChatBackend.ts`) уже проксирует эти
REST-роуты на тот же origin, что и AG-UI (`getChatBackendRestUrl()`).
То есть REST-запросы браузера уже сегодня доезжают до процесса, в котором
живёт агент.

Следствие: `/api/reference-suggest` — просто ещё один REST-роут
агент-хоста, рядом с `/api/threads`. Он автоматически оказывается у
агента-владельца справочников; никакой отдельной маршрутизации
(`sessionId`/`surfaceId` → сценарий), реестра справочников или участия
промежуточных звеньев не требуется — доставка та же, что у существующих
REST-роутов.

## Approach

`FormCard` остаётся self-contained (как в `form-card-dispatch-action`):
значения собираются рендерером на submit, без dataModel/path-биндинга.
Для `type: 'lookup'`:

- локальный React state (`query`, `options`, `selectedValue`, `open`) —
  по набору на каждое lookup-поле, не на форму;
- скрытый `<input type="hidden" name={field.name}
  value={selectedValue?.value ?? ''}>` — существующий сборщик значений в
  `handleSubmit` подхватывает выбор без изменений;
- подсказки — собственный `fetch` рендерера; `dispatchAction` остаётся
  только на submit, как сейчас.

## Data flow

1. Ввод ≥ `minChars`, debounce ~300мс → `fetch('/api/reference-suggest?'
   + new URLSearchParams({referenceId, query}))` с `AbortController`
   (отмена предыдущего запроса при новом keystroke).
2. BFF-роут потребителя: сессионная cookie → валидный access token
   (`createAuthReader().getValidAccessToken()`) → форвард на агент-хост с
   `Authorization: Bearer` (паттерн `proxyChatBackend.ts`, без
   бизнес-логики) — как существующие `/api/projects`, `/api/threads`.
3. Агент-хост: роут `/api/reference-suggest` резолвит свой `referenceId`
   (справочники агента — при агенте) → поиск `query` в источнике
   (БД/DaData/статика).
4. Ответ → дропдаун. Выбор → `{value, label}` в `selectedValue` + скрытый
   input → обычный submit `FormCard`; агент получает `value` (id).

## Decisions

### 1. Никакой маршрутизации справочников на нашей стороне

Suggest-роут живёт в том же процессе, что агент. `referenceId` резолвится
локально агентом — глобальной уникальности не требуется, реестр не нужен.
Ограничение фиксируем явно: если когда-либо за одним REST-origin окажется
несколько агентов с конфликтующими `referenceId`, вопрос маршрутизации
вернётся — решать его тогда, средствами той инфраструктуры, которая
объединит агентов (она же будет маршрутизировать и `/api/threads`).

### 2. Базовый URL — относительный путь, принятое ограничение

Рендерер использует захардкоженный относительный `/api/reference-suggest`.
Работает, пока каталог рендерится на одном origin с BFF-роутом (сейчас —
только spai-ui). Параметр конфигурации каталога не вводим: новый публичный
API ради одного поля не оправдан. Любой будущий потребитель каталога
обязан держать этот роут на своём origin.

### 3. Отмена устаревших ответов — `AbortController`

Новый keystroke отменяет предыдущий запрос; гонка ответов исключена на
уровне транспорта, эхо-`query` в ответе не требуется.

## Контракт роута агент-хоста (фиксируется, реализуется задачей в репо агента)

```
GET /api/reference-suggest?referenceId={id}&query={q}
Authorization: Bearer <user token>   (добавляет BFF)
→ 200 { options: Array<{ value: string, label: string, [key: string]: unknown }> }
→ 404 { error: "unknown_reference" }
```

- `referenceId` — короткое имя справочника агента (`cities`,
  `materials`, …).
- До ~10 доп. полей на опцию (например регион у города) — для отображения
  в строке дропдауна.
- Скоуп выдачи по claims из Bearer-токена — как у остальных REST-роутов
  агент-хоста.

## Schema changes

`packages/catalog-schemas/src/components/form-card.ts`:

```ts
export const formFieldTypeSchema = z.enum(['text', 'number', 'select', 'boolean', 'lookup']);

export const formFieldSchema = z
  .object({
    name: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
    type: formFieldTypeSchema,
    required: z.boolean().optional(),
    options: z.array(z.string()).min(1).optional(),      // select
    referenceId: z.string().min(1).max(80).optional(),   // lookup
    minChars: z.number().int().min(1).max(10).optional(),// lookup, default 3
    placeholder: z.string().min(1).max(120).optional(),
    defaultValue: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.object({value: z.string(), label: z.string()}), // lookup
      ])
      .optional(),
  })
  .strict();
```

`referenceId`/`minChars` — optional на уровне схемы, семантически
обязательны для `type: 'lookup'`; валидация связи — `.refine()` или
проверка в рендерере, решить в реализации.

`defaultValue` для `lookup` — `{value, label}`: дропдаун сразу показывает
label, submit отдаёт `value`.

## Renderer changes

`packages/catalog-react/src/renderers/form-card.tsx`:

- Ветка `field.type === 'lookup'` в `props.fields.map(...)`.
- `useState` на поле; debounce ~300мс; `fetch` + `AbortController`.
- Дропдаун — не `<select>` (произвольный `label` в строке), разметка под
  `tokens.*`.
- Скрытый `<input type="hidden" name={field.name}>` — `handleSubmit` не
  меняется.

## Edge cases

- `query.length < minChars` — сеть не дёргаем, дропдаун закрыт.
- Ошибка/таймаут/404 — тихий fallback: дропдаун пуст, поле редактируемо,
  submit не блокируется.
- Повторный keystroke до ответа — `AbortController`.
- Опция не выбрана — скрытый input пуст, «не введено».
- 401 от BFF (протухшая сессия) — тихий fallback, как ошибка; не
  инициируем ре-логин из компонента каталога.

## Non-goals

Отдельный `LookupField` вне `FormCard`. `ChoiceCard`. Реализация роута на
агент-хосте и BFF-роута у потребителя (только контракты и связанные
задачи). dataModel/path-биндинг. Коэрсинг типов на submit — на агенте.
