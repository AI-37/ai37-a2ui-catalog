# Design — FormCard lookup fetch-режим e2e

## Context

Action-режим lookup работает end-to-end: рендерер шлёт `lookup:suggest`,
`spai-teplo-calc/src/handler/handleLookupSuggest.ts` детерминированно (без
LLM) отвечает снапшотом с опциями (`cities` → КЛИМАТ СП131, `materials-m`
→ прил. М СП 50). Минус — каждый keystroke перевыпускает полный снапшот
формы через AG-UI/A2A.

Топология (проверено по коду, исправляет `form-card-lookup-field-fetch`):

- `@ai37/agent-host` (`createAgentHost`) сам монтирует только
  `/api/v1/health`, `/api/v1/version`, agent-card, `/a2a/v1`, `/agui`,
  опционально `/mcp` — и **возвращает Express app**. `jwtGuard`,
  `currentCtx`, `currentBearer` — публичные экспорты.
- `/api/projects`, `/api/threads` и пр. монтирует **оркестратор**
  (`spai-chat-backend/src/main.ts:74`) на этом app с тем же `jwtGuard` —
  готовый прецедент для `/api/reference-suggest`.
- `spai-ui` проксирует REST через `proxyChatBackend.ts` на
  `getChatBackendRestUrl()` (`CHAT_BACKEND_REST_URL` / origin
  `ORCHESTRATOR_AGUI_URL`) — тот же процесс, что AG-UI. GET+query уже
  ходит (`app/api/threads/route.ts`). Каталог рендерится на том же origin.
- Справочники живут у downstream-агентов (teplo), достижимых по A2A;
  реестр — `spai-chat-backend/config/remote-a2a.json`
  (`remote-a2a.config.ts`), у каждого агента есть `agentCardUrl`, из
  которого выводится его HTTP-origin.

Цепочка fetch-режима:
`браузер → /api/reference-suggest (spai-ui BFF, cookie→Bearer) →
оркестратор (jwtGuard, referenceId→агент) → агент-владелец (jwtGuard,
поиск) → { options } обратно`.

## Goals / Non-Goals

**Goals:**

- Лёгкий канал подсказок: keystroke не гоняет снапшот формы через A2A.
- `suggestMode: 'fetch'` как per-field опция; action-режим — дефолт, ни
  одно существующее сообщение не меняет поведения.
- Один источник контракта: путь роута и тип ответа — экспорты
  `@ai37/a2ui-catalog-schemas`.
- Свободный порядок деплоя: недоступный роут = тихий fallback, форма
  остаётся рабочей.

**Non-Goals:**

- Отдельный `LookupField` вне `FormCard`; `ChoiceCard`.
- dataModel/path-биндинг остальных полей (граница
  `form-card-dispatch-action`).
- Удаление action-режима (он остаётся дефолтом и fallback-каналом).
- Динамический discovery справочников; глобальный реестр `referenceId`
  вне конфига оркестратора.
- Коэрсинг типов на submit.

## Decisions

### 1. Режим — per-field `suggestMode`, default `'action'`

`z.enum(['action','fetch']).optional()` в `formFieldSchema`; default
применяет рендерер (паттерн `minChars`/`LOOKUP_MIN_CHARS_DEFAULT`).
Альтернативы: discriminated union по `type` — ломает `.strict()`-совместимость
и pydantic-зеркало; конфиг каталога/контекст рендерера — новый публичный
API ради одного поля и невозможность смешивать режимы в одной форме.

### 2. Путь роута захардкожен константой пакета

`LOOKUP_SUGGEST_ROUTE = '/api/reference-suggest'` в
`catalog-schemas/src/components/form-card-lookup-fetch.ts`; рендерер, BFF
и оркестратор импортируют её. Относительный same-origin путь — каталог
работает только у потребителя, держащего роут на своём origin (сейчас
spai-ui); URL в props поля не передаётся (агент не должен диктовать, куда
браузер ходит). Согласовать имя с командой оркестратора до публикации.

### 3. Маршрутизация `referenceId` — айтемы реестра ведут на ручки агента

Запись агента в `config/remote-a2a.json` расширяется мапой
`referenceSuggest: {referenceId → путь REST-ручки агента}` (для teplo:
`{"cities": "/api/suggest/cities", "materials-m": "/api/suggest/materials-m"}`).
Оркестратор: `referenceId` → айтем мапы → `origin(agentCardUrl) + путь +
?query=` с входящим Bearer; ответ — passthrough. Неизвестный `referenceId`
→ `404 {error: "unknown_reference"}` (единственное место, где он
возникает). Пути ручек — внутреннее дело агента, контракт
оркестратор↔агент: `GET {ручка}?query=` → `200 {options}`.
Альтернативы: generic-роут `?referenceId=` на самом агенте — лишняя
косвенность (агент дублирует диспетчеризацию, которую уже делает реестр);
справочники на оркестраторе — размазывает доменные данные; броадкаст по
агентам — лишние хопы. Коллизии `referenceId` между агентами — ошибка
конфигурации (валидировать при старте).

### 4. Агент отдаёт справочники топорными per-справочник ручками, SDK не меняется

`spai-teplo-calc/src/app.ts` перехватывает app из `createAgentHost`, до
`listen` монтирует две конкретные ручки — `GET /api/suggest/cities` и
`GET /api/suggest/materials-m` (только `query`) — с `jwtGuard` из
`@ai37/agent-host`; внутри — существующие `suggestCities`/`suggestMaterials`.
Никакого резолвера/404 на агенте: каждая ручка знает свой справочник.
Обязательных правок SDK нет (проверено: app возвращается, guard
экспортируется, оркестратор уже так делает). Опциональный polish в SDK —
хук `AgentHostOptions.routes?: (app, guard) => void` — не блокирует.

### 5. Рендерер: диспетчер + два контрола + общий комбобокс

`lookup-field.tsx` → диспетчер по `suggestMode ?? 'action'`;
`lookup-field-action.tsx` — текущая логика (dispatchAction +
`useDataModelValue` + echo-фильтр query); `lookup-field-fetch.tsx` —
локальный state опций, debounce `LOOKUP_DEBOUNCE_MS`, `AbortController`
(отмена предыдущего in-flight ⇒ echo-фильтр не нужен); общий
`lookup-combobox.tsx` — контролируемый презентационный комбобокс
(input `role="combobox"`, hidden input, listbox, выбор по `onMouseDown`,
`tokens.*`). Состояние-хук не выделяем: два потребителя не оправдывают
абстракцию.

### 6. Ошибки — тихий fallback на каждом звене

401/404/5xx/сеть/malformed → пустой дропдаун, поле редактируемо, submit
не блокируется; `AbortError` — не ошибка. Ре-логин из компонента каталога
не инициируем. На сервере неизвестный `referenceId` — 404 по контракту,
остальное — passthrough статуса.

## Контракт роута (все звенья)

Браузер → BFF → оркестратор (generic):

```
GET /api/reference-suggest?referenceId={id}&query={q}
Authorization: Bearer <user token>   (BFF добавляет из сессии; далее passthrough)
→ 200 { options: Array<{ value: string, label: string, [key: string]: unknown }> }
→ 404 { error: "unknown_reference" }   (только оркестратор: id нет в реестре)
```

Оркестратор → агент (конкретная ручка из реестра):

```
GET {origin(agentCardUrl)}{referenceSuggest[id]}?query={q}
Authorization: Bearer <user token>   (passthrough)
→ 200 { options: [...] }
```

- Тип ответа — `LookupSuggestResponse` из `@ai37/a2ui-catalog-schemas`.
- До ~10 доп. полей на опцию (например регион города) — для строки
  дропдауна.
- Скоуп выдачи по claims Bearer-токена — как у остальных REST-роутов.

## Risks / Trade-offs

- [Имя роута не согласовано] → константа `LOOKUP_SUGGEST_ROUTE`
  централизует замену до публикации; после публикации переименование =
  контракт-брейк. Согласовать в задаче 1.
- [Первый сетевой side-effect в catalog-react] → изолирован в
  `lookup-field-fetch.tsx`, покрыт тестами с мокнутым fetch; остальной
  каталог не трогает сеть.
- [Оркестратор как лишний хоп] → приемлемо: auth и реестр уже там;
  прямой доступ браузера к агентам потребовал бы CORS+экспозиции агентов
  наружу.
- [Дрейф `referenceIds` в конфиге vs реальные справочники агента] →
  тихий 404/пустой ответ по контракту; смок-тест в задачах деплоя.
- [Двойной lookup-код у teplo (action-handler + REST)] → оба тонкие
  обёртки над одними `suggestCities`/`suggestMaterials`; дублируется
  только транспорт.
- [Версии пакетов каталога разъехались (0.3.0/0.5.0), проверка в CI
  выключена] → bump до 0.6.0 всех — осознанно; python прыгает
  0.3.0→0.6.0.

## Migration Plan

1. Каталог: схема+константы → python → рендерер → тесты → `export:public`
   → релиз пакетов 0.6.0.
2. Агент (teplo): REST-роут (работает и до оркестратора — можно проверить
   curl'ом напрямую).
3. Оркестратор: `referenceIds` в конфиге + роут-форвардер.
4. spai-ui: BFF-роут, обновление `@ai37/a2ui-catalog-*` до 0.6.0.
5. Агент начинает слать `suggestMode: 'fetch'` на выбранных полях.

Rollback на любом шаге: агент перестаёт слать `suggestMode` (или шлёт
`'action'`) — поведение возвращается к текущему без правок фронта.

## Open Questions

- Финальное имя роута (`/api/reference-suggest`?) — за командой
  оркестратора.
- Нужен ли SDK-хук `AgentHostOptions.routes` сейчас или после второго
  агента со справочниками.
- Версионный bump 0.6.0 для python-пакета (0.3.0→0.6.0) — ок?
