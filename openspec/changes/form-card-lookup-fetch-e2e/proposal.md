# FormCard lookup: fetch-режим сквозь все репозитории (e2e)

## Why

Lookup-поле `FormCard` уже работает через action-канал (`lookup:suggest` →
агент → `updateDataModel`, change `form-card-lookup-field`), но каждый
keystroke гоняет полный снапшот формы через A2A/AG-UI-конвейер — тяжёлый
путь для автодополнения. Спека `form-card-lookup-field-fetch` описывала
лёгкий побочный канал (браузерный `fetch` → BFF → REST), однако устарела:
написана как альтернатива (а не второй режим) и опирается на неверную
топологию («роут автоматически у агента-владельца» — по коду `/api/*`
монтирует оркестратор, а справочники живут у downstream-агентов). Этот
change заменяет её: фиксирует fetch-режим как **опцию поля** и сквозной
контракт по всем четырём репозиториям.

## What Changes

- **Каталог (этот репо, `catalog-schemas` + `catalog-react`)**:
  - `formFieldSchema`: опциональный `suggestMode: 'action' | 'fetch'`
    (default `'action'` — применяет рендерер; не ломающее).
  - Новые константы контракта: `LOOKUP_SUGGEST_ROUTE =
    '/api/reference-suggest'`, `LOOKUP_DEBOUNCE_MS = 300`, тип
    `LookupSuggestResponse` — экспорт из `@ai37/a2ui-catalog-schemas`,
    чтобы BFF/оркестратор/агент использовали одну строку и один тип.
  - Рендерер: `lookup-field.tsx` → диспетчер режимов;
    `lookup-field-action.tsx` (текущая логика), `lookup-field-fetch.tsx`
    (debounce + `fetch` + `AbortController`, тихий fallback), общий
    презентационный `lookup-combobox.tsx`.
  - Python-зеркало (`catalog-python`), фикстуры, тесты, `export:public`.
- **spai-ui (BFF)**: тонкий прокси-роут
  `app/api/reference-suggest/route.ts` — зеркало `app/api/threads/route.ts`
  (GET, passthrough query через `proxyChatBackend`, cookie → Bearer).
- **spai-chat-backend (оркестратор)**: `GET /api/reference-suggest` в
  `src/main.ts` рядом с `/api/projects` (тот же `apiGuard`); запись агента
  в реестре (`config/remote-a2a.json`) расширяется мапой `referenceSuggest:
  {referenceId → путь REST-ручки агента}`; роут форвардит `query` на
  `origin(agentCardUrl) + путь` с тем же Bearer; неизвестный `referenceId`
  → 404.
- **spai-teplo-calc (владелец справочников)**: две топорные REST-ручки —
  `GET /api/suggest/cities` и `GET /api/suggest/materials-m` (только
  `query`) — на своём Express из `createAgentHost` (`app.ts`),
  переиспользующие существующие `suggestCities` / `suggestMaterials`
  (`cities` → КЛИМАТ СП131, `materials-m` → прил. М СП 50) и `jwtGuard`
  из `@ai37/agent-host`; диспетчеризация по `referenceId` — не на агенте,
  а в реестре оркестратора.
- **ai37-agent-sdk**: обязательных изменений НЕТ — `createAgentHost`
  возвращает Express, `jwtGuard`/`currentCtx` экспортируются (проверено;
  оркестратор уже монтирует свои роуты так). Опционально: first-class хук
  `AgentHostOptions.routes` и dev-паритет auth-overrides для кастомных
  роутов.
- Спека `form-card-lookup-field-fetch` помечается как superseded этим
  change (не реализуется).

## Capabilities

### New Capabilities

- `form-card-lookup-fetch-mode`: per-field режим `suggestMode: 'fetch'` в
  схеме и рендерере каталога — debounced same-origin `fetch` подсказок с
  отменой in-flight и тихим fallback; action-режим остаётся дефолтом.
- `reference-suggest-bff-route`: BFF-роут spai-ui — авторизованный
  passthrough `GET /api/reference-suggest` на REST оркестратора.
- `reference-suggest-orchestrator-routing`: роут оркестратора — резолв
  `referenceId` → агент-владелец (реестр remote-a2a) и форвард запроса с
  Bearer; контракт ответа/ошибок.
- `reference-suggest-agent-route`: REST-роут агента-владельца
  (spai-teplo-calc) — поиск по своим справочникам, тот же auth-guard, что
  у agent-surface.

### Modified Capabilities

<!-- Главных спек в openspec/specs/ нет; требования action-режима lookup
     (change form-card-lookup-field) не меняются. -->

## Impact

- Репозитории: `ai37-a2ui-catalog` (схема, рендерер, python, public
  artifacts), `spai-ui` (+1 route-файл), `spai-chat-backend` (+1 роут и
  правка схемы `remote-a2a.config.ts` + `config/remote-a2a.json`),
  `spai-teplo-calc` (+1 роут поверх готовых suggest-функций).
  `ai37-agent-sdk` — без обязательных правок.
- Схема каталога расширяется не ломающим образом (optional-поле);
  `CATALOG_VERSION` остаётся `v2`; артефакты `public/` перегенерируются.
- Контрактная связность: путь роута и форма ответа зафиксированы
  константами/типом в `@ai37/a2ui-catalog-schemas` — потребители тянут их
  из пакета, а не копипастят.
- Порядок деплоя свободный: пока роутов нет, fetch-режим тихо деградирует
  (пустой дропдаун, submit работает); агенты продолжают слать формы без
  `suggestMode` до полного раската.
- Имя роута `/api/reference-suggest` — согласовать с командой оркестратора
  ДО публикации константы (переименование после — контракт-брейк).
