# Design — FormCard lookup-поле

## Approach

`FormCard` остаётся self-contained (как зафиксировано в
`form-card-dispatch-action`): значения полей собираются рендерером на
submit, без dataModel/path-биндинга. Для `type: 'lookup'` добавляется
локальный React state (`query`, `selectedValue`, `open` — по набору на
каждое lookup-поле, не на форму) и скрытый
`<input type="hidden" name={field.name} value={selectedValue?.value ?? ''}>`,
чтобы существующий сборщик значений (`querySelector('[name=...]')` в
`handleSubmit`) подхватывал выбор без изменений.

Единственное исключение из «без dataModel»: **опции подсказок** приходят от
агента через `updateDataModel` и читаются рендерером реактивно — это канал
доставки ответа, не биндинг полей формы.

## Data flow

1. Пользователь ввёл ≥ `minChars` символов → debounce ~300мс → рендерер:
   `context.dispatchAction({event: {name: 'lookup:suggest', context:
   {fieldName, referenceId, query}}})`. Протокольное `action`-сообщение
   само несёт `surfaceId` и `sourceComponentId` — агент знает, чья форма.
2. Транспорт существующий: `dispatchAction` → `A2UIProvider.onAction` →
   `forwardedProps.a2uiAction` → `runAgent` → AG-UI POST на оркестратор с
   Bearer. Ничего нового ни в компоненте, ни в spai-ui.
3. Агент-хост распознаёт `lookup:suggest` детерминированно (по имени
   события, без LLM), ищет `query` в справочнике `referenceId` (свои
   справочники агента — глобальный реестр не нужен) и отвечает
   ACTIVITY_SNAPSHOT **с тем же `messageId`, что у исходного снапшота
   формы** (см. «Проверено» ниже), содержащим полный самодостаточный набор
   операций + `updateDataModel {surfaceId, path:
   '/lookup/{fieldName}/options', value: {query, options: [{value, label},
   ...]}}`. Ведущий слэш в path обязателен: DataModel ключует сигналы
   точной строкой, `lookup/…` и `/lookup/…` — разные ключи, несовпадение
   молча ломает уведомления (хелпер `lookupOptionsPath()` в
   `catalog-schemas`).
4. Рендерер подписан на этот путь dataModel → дропдаун обновился.
5. Клик по опции → `{value, label}` в `selectedValue` + скрытый input →
   обычный submit `FormCard`; агент получает `value` (id), не строку.

## Проверено по исходникам (@ag-ui/client, @copilotkit/react-core v2, @a2ui/web_core)

Разведка по node_modules spai-ui, определяет жёсткие требования к ответу
хоста:

- **Судьбу снапшота решает `event.messageId`, не `surfaceId`.** Тот же
  `messageId` → редьюсер ACTIVITY_SNAPSHOT заменяет content существующего
  activity-сообщения на месте (`replace: true` по умолчанию), React-элемент
  (key = `message.id`) не перемонтируется, `MessageProcessor` в `useRef`
  живёт → `updateDataModel` реактивно мутирует dataModel (Preact-сигналы).
  Новый `messageId` → отдельное сообщение с изолированным процессором;
  одинокий `updateDataModel` там кидает `A2uiStateError: Surface not found`
  → error-box вторым сообщением. Кросс-сообщенческого хранилища surface'ов
  по `surfaceId` в CopilotKit v2 нет.
- **Ответ хоста — полный самодостаточный снапшот с тем же `messageId`**
  (createSurface + updateComponents + updateDataModel): лишний
  `createSurface` при живом surface процессор отбрасывает сам
  (`SurfaceMessageProcessor` фильтрует), а сообщение остаётся пригодным
  для replay треда после перезагрузки. Одинокий `updateDataModel` с тем же
  `messageId` работает в живой сессии, но ломает replay (после reload от
  формы остаётся только патч без createSurface).
- **Введённый текст переживает обновление**: то же mounted React-дерево
  (re-render, не remount), uncontrolled-инпуты сохраняют DOM-значения.
- **Подписка на опции**: Preact-сигналы — `DataModel.getSignal(path)` /
  `subscribe(path, onChange)` (`@a2ui/web_core` v0_9); в React — резолв
  path-bound props биндером `createComponentImplementation` или сырой
  `ComponentContext` через `createBinderlessComponentImplementation`.
  Точный способ для `FormCard` (у которого props статические) — решить в
  реализации; кандидат: подписка на `lookup/{fieldName}/options` через
  `context` внутри рендерера.
- Штатный `@ag-ui/a2ui-middleware` выводит `messageId` детерминированно
  (`a2ui-surface-${toolCallId}`) внутри одной генерации, но не между
  run'ами — хосту нужно своё соответствие `surfaceId → messageId`.

## Контракт agent-хоста (фиксируется, реализуется отдельным change в его репо)

- Вход: A2UI client action `{name: 'lookup:suggest', surfaceId,
  sourceComponentId, context: {fieldName, referenceId, query}}`.
- Обработка: детерминированная (вне LLM); `referenceId` резолвится в
  контексте агента-владельца формы.
- Ответ: ACTIVITY_SNAPSHOT с тем же `messageId`, полный набор операций,
  опции в `updateDataModel` по пути `/lookup/{fieldName}/options` (ведущий
  слэш обязателен; хелпер `lookupOptionsPath()` из `catalog-schemas`),
  значение `{query, options: [{value, label}, ...]}` (+ до ~10 доп. полей
  на опцию для отображения в строке дропдауна). Эхо `query` — для
  отбрасывания устаревших ответов на клиенте.
- Открытый вопрос хосту: как он сегодня выбирает `messageId` при эмите
  формы и как переиспользовать его в последующем run — проверить до
  реализации хендлера.

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

`referenceId`/`minChars` — optional на уровне схемы (не заставляем весь
union их нести), но семантически обязательны для `type: 'lookup'`;
валидация связи `type ↔ referenceId` — на усмотрение реализации
(`.refine()` или проверка в рендерере), не блокирует этот change.

`defaultValue` для `lookup` — объект `{value, label}` (не голая строка),
чтобы дропдаун сразу показывал человекочитаемый label при предзаполненном
значении, а submit — как всегда, только `value`.

## Renderer changes

`packages/catalog-react/src/renderers/form-card.tsx`:

- Новая ветка в `props.fields.map(...)` для `field.type === 'lookup'`.
- Локальный `useState` на поле (query, selectedValue, open) — по набору на
  каждое lookup-поле, не на форму.
- Debounce ~300мс на ввод; при `query.length >= minChars` —
  `context.dispatchAction` с `lookup:suggest` (см. Data flow).
- Опции — реактивное чтение `/lookup/{fieldName}/options` из dataModel
  surface'а. Решено в реализации: хук `useDataModelValue` —
  `context.dataContext.dataModel.getSignal(path).value` как снапшот +
  `subscribe(path, cb)` через `React.useSyncExternalStore`.
- Дропдаун — не `<select>` (нужен произвольный `label` в каждой строке),
  своя разметка под `tokens.*` (как остальной `FormCard`).
- Скрытый `<input type="hidden" name={field.name}>` — существующий
  `handleSubmit` не меняется вообще.

## Edge cases

- `query.length < minChars` — action не шлём, дропдаун закрыт.
- Устаревший ответ (пользователь уже ввёл больше символов) — в `value`
  опций хост кладёт эхо `query`; рендерер игнорирует ответ, чей `query`
  не равен текущему вводу (last-write-wins поверх debounce).
- Ошибка/молчание хоста — тихий fallback: дропдаун пуст, поле остаётся
  редактируемым текстом, submit формы не блокируется.
- Пользователь вводит текст, но не выбирает опцию — `selectedValue` не
  установлен, скрытый input пуст; трактуется агентом как «не введено»
  (как пустое текстовое поле сейчас).

## Non-goals

Отдельный `LookupField`-компонент вне `FormCard`. `ChoiceCard` (не
затрагивается). Общий dataModel/path-биндинг для полей формы (исключение —
только канал опций lookup). Реализация хендлера на агент-хосте и его
соответствие `surfaceId → messageId` (только контракт). Коэрсинг типов на
submit — как и для остальных полей, на агенте.

## Связанные changes

Change `form-card-lookup-fetch-e2e` наслаивает поверх этого канала второй
режим подсказок: per-field `suggestMode: 'fetch'` (debounced GET через BFF
на роут оркестратора). Описанный здесь action-канал остаётся дефолтом
(`suggestMode` не задан → `'action'`), его контракт не меняется; спеки не
конкурируют.
