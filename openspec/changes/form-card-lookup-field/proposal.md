# FormCard: lookup-поле для автодополнения по справочникам

## Why

В формах (например «Исходные данные» теплотехнического расчёта) нужны поля
с автодополнением по большим справочникам — города, материалы, и другие.
Существующие типы `formFieldSchema` (`text`, `number`, `select`, `boolean`)
для этого не годятся: `select` требует весь набор опций заранее (тысячи
записей — дорого и неюзабельно), `text` не даёт подсказок.

Подсказки идут **тем же каналом, которым живёт форма** — A2UI `action` →
агент → `updateDataModel`. Никаких side-channel REST-эндпоинтов, URL в
props или ручного неймспейсинга справочников: action-сообщение протокола
уже несёт `surfaceId`, попадает агенту-владельцу формы, и каждый агент
резолвит только свои `referenceId` — коллизии имён между сценариями
исчезают по построению. Авторизация — существующая (канал уже
аутентифицирован), для потребителя (spai-ui) изменений нет.

## What Changes

- `formFieldSchema` (`packages/catalog-schemas/src/components/form-card.ts`):
  новый вариант `type: 'lookup'` + поля `referenceId` (имя справочника в
  контексте агента-владельца формы) и `minChars` (порог начала поиска, по
  умолчанию 3).
- Рендерер `FormCard` (`packages/catalog-react/src/renderers/form-card.tsx`):
  для `field.type === 'lookup'` — `<input>` с выпадающим списком подсказок.
  На debounced ввод рендерер шлёт `context.dispatchAction({event: {name:
  'lookup:suggest', context: {fieldName, referenceId, query}}})`; опции
  читает реактивно из dataModel по конвенциональному пути
  `/lookup/{fieldName}/options` (ведущий слэш обязателен). Выбранное
  значение попадает в существующий
  submit-flow как обычное поле (без изменения `handleSubmit`).
- Ответная сторона (агент-хост): детерминированный хендлер lookup-actions,
  отвечающий ACTIVITY_SNAPSHOT **с тем же `messageId`, что у исходного
  снапшота формы** — связанный change в репозитории агент-хоста, здесь
  фиксируется только контракт (см. `design.md`).

## Impact

- Схема `catalog-schemas` расширяется не ломающим образом — новый enum-
  вариант `type`, существующие `text/number/select/boolean` не меняются.
- `catalog-react`: `form-card.tsx` — первый компонент каталога, читающий
  dataModel (до сих пор все props статические) и шлющий не-submit action.
- `spai-ui`: изменений нет — существующий путь `dispatchAction →
  forwardedProps.a2uiAction → runAgent` уже доставляет action агенту с
  авторизацией; аккордеон ключуется по `message.id`, при том же
  `messageId` вторая «Форма» не появляется.
- **Non-goals**: отдельный `LookupField`-компонент вне `FormCard`;
  `ChoiceCard`; реализация хендлера на агент-хосте (только контракт);
  общий dataModel/path-биндинг для остальных полей `FormCard` (та же
  граница, что в `form-card-dispatch-action`, — исключение только для
  канала опций lookup).
