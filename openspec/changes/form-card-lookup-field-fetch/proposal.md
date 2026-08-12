# FormCard: lookup-поле через fetch

> **SUPERSEDED** изменением `form-card-lookup-fetch-e2e`: fetch реализован
> как второй per-field режим (`suggestMode`), а не альтернатива action-каналу.
> Топология здесь описана неверно: `/api/*` монтирует не agent-host SDK, а
> оркестратор (`spai-chat-backend/src/main.ts`); справочники живут у
> downstream-агентов, резолв `referenceId` — забота роута оркестратора.
> Этот документ не реализуется — см. актуальные артефакты e2e-change.

## Why

В формах (например «Исходные данные» теплотехнического расчёта) нужны поля
с автодополнением по большим справочникам — города, материалы, и другие.
Существующие типы `formFieldSchema` (`text`, `number`, `select`, `boolean`)
не годятся: `select` требует весь набор опций заранее, `text` не даёт
подсказок.

Подсказки компонент получает **сам, минуя агентский диалоговый канал**:
debounced `fetch` из браузера на BFF-роут потребителя, тот проксирует на
REST агент-хоста — тем же путём, каким уже ходят `/api/projects` и
`/api/threads`. A2UI v0.9 этому не препятствует: протокол не шлёт ничего
на сервер по мере ввода, а рендерер каталога — обычный React-компонент,
внутренняя реализация которого протоколом не ограничивается.

Топология (проверено по коду): `@ai37/agent-host` монтирует AG-UI и REST
`/api/*` в одном процессе — suggest-роут на агент-хосте автоматически
оказывается у агента-владельца справочников, отдельная маршрутизация не
нужна (детали — `design.md` → «Топология»).

## What Changes

- `formFieldSchema` (`packages/catalog-schemas/src/components/form-card.ts`):
  новый вариант `type: 'lookup'` + `referenceId` (имя справочника агента)
  и `minChars` (порог начала поиска, default 3).
- Рендерер `FormCard` (`packages/catalog-react/src/renderers/form-card.tsx`):
  для `field.type === 'lookup'` — `<input>` + дропдаун; debounced `fetch`
  на `/api/reference-suggest` (относительный путь, same-origin) с
  параметрами `referenceId`, `query`; выбор → скрытый input →
  существующий submit-flow без изменений.
- Потребитель (`spai-ui`): тонкий прокси-роут
  `app/api/reference-suggest/route.ts` по образцу `proxyChatBackend.ts` —
  связанная задача в его репозитории.
- Агент-хост: REST-роут `/api/reference-suggest`, резолв своего
  `referenceId` → источник (БД/DaData/статика) — связанная задача в репо
  агента; здесь фиксируется контракт (см. `design.md`).

## Impact

- Схема `catalog-schemas` расширяется не ломающим образом (новый
  enum-вариант `type`).
- `catalog-react`: первый компонент каталога с сетевым side-эффектом;
  относительный путь `/api/reference-suggest` — принятое ограничение:
  каталог работает только у потребителя, который держит этот роут на
  своём origin (сейчас — spai-ui; см. Decisions в `design.md`).
- `spai-ui`: +1 BFF-роут по готовому паттерну.
- Агент-хост: +1 REST-роут рядом с существующими `/api/*`.
- **Non-goals**: отдельный `LookupField` вне `FormCard`; `ChoiceCard`;
  реализация роута на агент-хосте (только контракт);
  dataModel/path-биндинг (граница из `form-card-dispatch-action`).
