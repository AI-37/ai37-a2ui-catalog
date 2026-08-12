# Вариант 1 — lookup через fetch внутри компонента

> Один из двух проработанных вариантов. Сравнение и рекомендация —
> `arch-comparison.md`; альтернатива — `arch-option-2-action-channel.md`.

## Суть

Lookup-поле — новый `type: 'lookup'` в `formFieldSchema` каталога
(`FormCard`). Подсказки рендерер получает **сам, в обход агента и
AG-UI-канала**: debounced `fetch` из браузера на BFF-роут потребителя,
тот проксирует на REST оркестратора.

Опора на A2UI v0.9: протокол намеренно не шлёт ничего на сервер по мере
ввода («Two-Way Binding is local to the client. User inputs do not
automatically trigger network requests to the server»), а рендерер
каталога — обычный React-компонент, протокол не ограничивает его
внутреннюю реализацию. Отсюда исходная посылка варианта: собственный
`fetch` внутри рендерера канону не противоречит, единственный
протокольный вызов — `dispatchAction` на submit.

## Approach

`FormCard` остаётся self-contained (как в `form-card-dispatch-action`):
значения собираются рендерером на submit, без dataModel/path-биндинга.
Для `type: 'lookup'`:

- локальный React state внутри `FormCard` (`query`, `options`,
  `selectedValue`, `open`) — по набору на каждое lookup-поле, не на форму;
- скрытый `<input type="hidden" name={field.name}
  value={selectedValue?.value ?? ''}>` — существующий сборщик значений
  (`querySelector('[name=...]')` в `handleSubmit`) подхватывает выбор без
  изменений в логике сбора.

## Data flow

keystroke → debounce ~300мс → `fetch` на BFF-роут
(`/api/reference-suggest`, с `AbortController` — отмена предыдущего
запроса при новом keystroke) → рендер выпадающего списка → клик по опции →
запись в `selectedValue` + скрытый input → обычный submit `FormCard`.

Целиком клиентский side-эффект внутри рендерера: не проходит через
`context.dispatchAction`, не меняет `dataModel`, не появляется в
AG-UI-стриме.

## Транспорт: BFF как прокси, не резолвер

Потребитель (Next.js BFF) уже имеет устоявшийся паттерн
(`proxyChatBackend.ts`): форвард запроса на оркестратор с добавлением
`Authorization: Bearer <token>` из `createAuthReader().getValidAccessToken()`
(тот же токен, что использует `agentGateway.ts` для AG-UI). Новый роут
`app/api/reference-suggest/route.ts` — такой же тонкий прокси, без
собственной бизнес-логики (как существующие `/api/projects`,
`/api/threads`).

Резолв `referenceId → конкретный источник данных` (БД, DaData, статика) —
ответственность оркестратора, не BFF.

Авторизация компонента в браузере: токен не нужен — обычный same-origin
`fetch` с сессионной cookie на `/api/reference-suggest`, как у любого
другого `app/api/*` роута потребителя.

## Неймспейсинг: много агентов/сценариев на одном оркестраторе

Один оркестратор ведёт множество агентов/сценариев; у каждого может быть
свой справочник под одинаковым коротким именем (`materials` одного
сценария — не тот же список, что `materials` другого). Голого
`referenceId` недостаточно для однозначного резолва.

Рассмотренные внутри варианта решения:

1. **Составной `referenceId`** (`scenario.materials`) — минус: требует
   дисциплины именования от всех агентов без центрального контроля.
2. **URL эндпоинта в props поля** (агент присылает, куда ходить) —
   минус: бэкенд/промпт-инъекция получает контроль над тем, куда браузер
   пользователя шлёт запросы; требует allowlist-валидации.
3. **Проброс `sessionId`** — рабочее решение внутри варианта: BFF-роут
   добавляет в suggest-запрос `sessionId` текущего диалога (тот же
   идентификатор, что уже идёт в AG-UI properties как `session_id`,
   привязан к активному thread). Оркестратор по `sessionId` знает, какой
   агент/сценарий ведёт сессию, и резолвит `referenceId` в его контексте.
   Компонент каталога `sessionId` не видит — его подставляет BFF-роут.

## Контракт suggest-эндпоинта

```
GET /api/reference-suggest?sessionId={id}&referenceId={id}&query={q}
→ { options: Array<{ value: string, label: string, [key: string]: unknown }> }
```

- `sessionId` — добавляется BFF-роутом, не компонентом.
- `referenceId` — короткое имя справочника, резолвится оркестратором в
  контексте `sessionId`; не обязан быть глобально уникальным.
- До ~10 доп. полей на опцию (например регион у города) — для отображения
  в строке дропдауна.
- Авторизация на оркестраторе — Bearer из пользовательской сессии, скоуп
  по claims из токена (как остальные REST-роуты).

## Схема (общая для обоих вариантов)

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

`defaultValue` для `lookup` — `{value, label}`, чтобы дропдаун сразу
показывал человекочитаемый label, а submit отдавал `value`.

## Рендерер

- Ветка `field.type === 'lookup'` в `props.fields.map(...)`.
- Дропдаун — не `<select>` (нужен произвольный `label` в каждой строке),
  своя разметка под `tokens.*`.
- Debounce ~300мс + `AbortController` на предыдущий запрос.
- Скрытый input; `handleSubmit` не меняется.

## Edge cases

- `query.length < minChars` — сеть не дёргаем, дропдаун закрыт.
- Ошибка/таймаут fetch — тихий fallback: дропдаун пуст, поле редактируемо,
  submit не блокируется.
- Повторный keystroke до ответа — отмена предыдущего через
  `AbortController`, в state только последний.
- Опция не выбрана — скрытый input пуст, «не введено».

## Нерешённые в варианте вопросы

- **Базовый URL в каталоге**: рендерер должен знать адрес BFF.
  Захардкоженный относительный путь работает только пока каталог
  рендерится внутри одного конкретного потребителя; параметр конфигурации
  каталога — новый публичный API ради одного поля.
- **Владелец контракта** `/api/reference-suggest` на стороне оркестратора
  не определён.

Сравнение с вариантом 2 — `arch-comparison.md`.
