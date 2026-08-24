# LiftEditorNext: блок подбора конфигураций под введённое здание

## Why

Пользователь заполняет «Здание» (для 52941 — N этажей и A жильцов) и дальше
должен сам придумать, какой лифт вписать: Q, Vн, дверь, h/t123. Подбор у нас
уже есть и он детерминированный (`sweepCatalog52941` в агенте
`spai-elevator-calc-agent`, без LLM), но живёт только как команда чата с
markdown-таблицей — из формы до него не дотянуться.

Отдать список ходом диалога нельзя: `calc:draft` намеренно «немой» (ответный
снапшот пересеял бы локальное состояние формы — раскрытую секцию и набираемое
значение), поэтому данные компонент забирает **сам**, лёгким побочным каналом
`GET /api/agent-resource?resource=…` — тем же, которым уже ходит fetch-режим
lookup-поля (`LOOKUP_SUGGEST_ROUTE`) и «Скачать» протокола
(`protocol.downloadUrl`). Ручку `/api/recommend` заводит зеркальный change
агента `recommend-resource`.

## What Changes

- **`catalog-schemas`**: опциональный проп `recommend` у `liftEditorPropsSchema`
  (аддитивно, `CATALOG_VERSION` остаётся `v2`) — `resource`, опциональный
  `taskId`, декларативный список `params` (какие поля какого экрана уходят в
  query и какие из них обязательны) и подписи блока. Плюс контракт ответа:
  константы `AGENT_RESOURCE_ROUTE`, `RECOMMEND_DEBOUNCE_MS` и типы
  `RecommendResourceResponse` / `RecommendResourceVariant` — единственный
  источник формы ответа для агента и компонента.
- **`catalog-react`**: блок рекомендаций в `LiftEditorNext` между секцией
  «Здание» и секциями лифтов — стейт-машина `hidden → loading → shown → stale`,
  debounced `fetch` с `AbortController`, топ-2 карточками + селект с
  остальными, клик заполняет лифтовые секции и шлёт немедленный черновик.
  Тихая деградация: нет пропа, нет роута, сбой сети — блока просто нет, форма
  работает как раньше.
- **Нынешний `LiftEditor` (старый рендерер) не трогаем** — он остаётся эталоном
  сравнения (граница из `lift-editor-next`), а агент шлёт `LiftEditorNext`
  (`spai-elevator-calc-agent/src/domain/lifts/calc-doc/form-args.ts:63`).
- Python-зеркало, фикстуры, `export:public`, витрина в `apps/demo` со
  стаб-фетчем.

## Capabilities

### New Capabilities

- `lift-editor-recommend-block`: блок подбора конфигураций в `LiftEditorNext` —
  контракт пропа и ответа, условия запроса и отмены, актуальность списка,
  презентация, семантика применения варианта, деградация канала.

### Modified Capabilities

<!-- нет: контракт submit/draft (`lift-editor-draft-save`) и состав секций
     (`lift-editor-next`) не меняются — применение варианта пользуется уже
     существующим путём черновика. -->

## Impact

- Схема расширяется не ломающим образом: без `recommend` поведение
  байт-в-байт прежнее (путь отката).
- Второй компонент каталога с сетевым side-эффектом (первый — lookup
  fetch-режим); тот же same-origin относительный путь и то же ограничение:
  каталог работает у потребителя, который держит `/api/agent-resource` на своём
  origin (сейчас spai-ui → spai-chat-backend).
- Кросс-репо (зеркальные changes, вне этого репо):
  `spai-elevator-calc-agent` — ручка `GET /api/recommend` и проп `recommend` в
  props формы (change `recommend-resource`; **его формат вариантов нужно
  привести к `RecommendResourceVariant` этого спека** — см. design.md,
  Решение 4); `spai-chat-backend` — строка `"lift-recommend": "/api/recommend"`
  в реестре remote-a2a агента elevator-calc.
- Порядок деплоя свободный: пока агент не шлёт `recommend`, новый код спит;
  пока ресурс не зарегистрирован — блок молча не показывается.
