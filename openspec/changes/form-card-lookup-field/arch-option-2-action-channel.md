# Вариант 2 — lookup через A2UI action-канал

> Один из двух проработанных вариантов, **рекомендуемый** по итогам
> сравнения (`arch-comparison.md`); альтернатива —
> `arch-option-1-component-fetch.md`. Детализация — `design.md`,
> задачи — `tasks.md`.

## Принцип

Подсказки идут **тем же каналом, которым живёт форма**: A2UI `action` от
компонента → агент-владелец формы → `updateDataModel` в ответ. Никаких
новых эндпоинтов, URL в props, ручного неймспейсинга справочников.

## Data flow

1. Ввод ≥ `minChars` (default 3), debounce ~300мс → рендерер:
   `context.dispatchAction({event: {name: 'lookup:suggest', context:
   {fieldName, referenceId, query}}})`. Протокольное `action`-сообщение
   само несёт `surfaceId` и `sourceComponentId`.
2. Существующий транспорт: `dispatchAction` → `A2UIProvider.onAction` →
   `forwardedProps.a2uiAction` → `runAgent` → AG-UI POST на оркестратор с
   Bearer. Это не submit формы — отдельное событие тем же механизмом;
   значения полей не отправляются, submit остаётся как есть.
3. Агент-хост различает `lookup:suggest` **по имени события,
   детерминированно, до тяжёлых/LLM-вызовов**; ищет `query` в своём
   справочнике `referenceId` (каждый агент резолвит только свои —
   глобальный реестр не нужен).
4. Ответ: `ACTIVITY_SNAPSHOT` **с тем же `messageId`, что у исходного
   снапшота формы**, полный самодостаточный набор операций
   (createSurface + updateComponents + updateDataModel), опции — в
   `updateDataModel {surfaceId, path: 'lookup/{fieldName}/options',
   value: {query, options: [{value, label}, ...]}}`.
5. Рендерер подписан на путь в dataModel (Preact-сигналы) → в дропдауне
   новые айтемы; форма не перемонтируется, введённый текст сохраняется.
6. Выбор → `{value, label}` → скрытый `<input type="hidden">` → обычный
   submit `FormCard`; агент получает `value` (id), не строку.

## Жёсткие требования (проверено по исходникам @ag-ui/client, @copilotkit/react-core v2, @a2ui/web_core)

- Судьбу снапшота решает `event.messageId`, не `surfaceId`. Тот же
  `messageId` → замена content activity-сообщения на месте, React-дерево
  не перемонтируется, `updateDataModel` реактивно обновляет подписчиков.
  Новый `messageId` → отдельное изолированное сообщение; одинокий
  `updateDataModel` там падает с `Surface not found`.
- Ответ — полный самодостаточный снапшот: лишний `createSurface` при
  живом surface процессор отбрасывает сам, а сообщение остаётся пригодным
  для replay треда после перезагрузки.
- Хост обязан хранить соответствие `surfaceId → messageId` (штатный
  `@ag-ui/a2ui-middleware` переиспользует `messageId` только внутри одной
  генерации, между run'ами — нет). Это единственное место за пределами
  готового паттерна; протоколу не противоречит.

## Ответственность по репозиториям

| Репозиторий | Изменение |
| --- | --- |
| `ai37-a2ui-catalog` / `catalog-schemas` | `'lookup'` в `formFieldTypeSchema`; `referenceId`, `minChars`; `defaultValue` `{value, label}` |
| `ai37-a2ui-catalog` / `catalog-react` | ветка рендера lookup: debounce → `dispatchAction`, подписка на dataModel, дропдаун, скрытый input |
| агент-хост | детерминированный хендлер `lookup:suggest` (вне LLM) + ответ с тем же `messageId`; соответствие `surfaceId → messageId` |
| `spai-ui` | **без изменений** (mock-агент расширить для smoke) |

## Edge cases

- `< minChars` — action не шлётся.
- Устаревший ответ — эхо `query` в value; рендерер игнорирует ответ, чей
  `query` ≠ текущему вводу.
- Ошибка/молчание хоста — дропдаун пуст, поле редактируемо, submit не
  блокируется.
- Опция не выбрана — значение поля пустое («не введено»).

## Цена

Каждый suggest — run-цикл оркестратора: латентность выше голого REST
(~100–300мс против ~50–150мс), смягчается debounce и `minChars`.

Сравнение с вариантом 1 — `arch-comparison.md`.
