# AI37 A2UI Catalog

<!-- ai37:card:start (managed by doc-bot — do not edit inside) -->
# ai37-a2ui-catalog

## Описание
Монорепозиторий собственного A2UI-каталога AI-37 («AI37 Custom A2UI Catalog»): канонические Zod-схемы компонентов, React-рендереры, Pydantic-модели для валидации на Python, общие фикстуры и тесты. С 0.48.0 в нём живёт `@ai37/a2ui-mcp-app` — однофайловый HTML-view, который показывает A2UI-поверхность каталога внутри MCP App и отправляет действия поверхности агенту через app-only инструмент. JSON-артефакты каталога публикуются на GitHub Pages, а их URL служит `catalogId`.

## Стек
- TypeScript 5.9, Node ≥ 22, pnpm ≥ 10 (`packageManager: pnpm@10.29.3`), workspace `packages/*` + `apps/*`.
- Zod 3 + `zod-to-json-schema` (схемы), React 19 + `@a2ui/react`/`@a2ui/web_core` 0.10.1 (зафиксированы через `pnpm.overrides`), `@base-ui/react`, KaTeX (рендереры).
- MCP Apps: `@modelcontextprotocol/ext-apps` 2.0.4, `@modelcontextprotocol/client` ^2.4.0, `@modelcontextprotocol/core` ^2.4.0 (пакет view).
- Сборка: tsup, tsx, Vite 7 (`vite-plugin-singlefile` — один HTML без внешних ресурсов), Vitest 4 (jsdom, Testing Library).
- Python ≥ 3.13 (ограничение `>=3.13,<4.0`), Pydantic 2, Poetry, pytest (`packages/catalog-python`).
- Единая синхронная версия пакетов и каталога — 0.48.0.

## Схема работы
- `packages/catalog-schemas` задаёт схемы компонентов и регистрирует их в `catalog.ts`. Константы `CATALOG_ID`, `A2UI_BASE_CATALOG_ID`, `CATALOG_COMPONENT_NAMES`, `AGENT_RESOURCE_ROUTE`, `LOOKUP_SUGGEST_ACTION` экспортируются отдельно через `./constants`.
- `generate-artifacts.ts` (`pnpm run export:public`) генерирует `catalog.json` и JSON Schema компонентов в `public/a2ui/catalogs/ai37-a2ui/<версия>/`. Текущая версия каталога — `CATALOG_VERSION = 'v2'`, `v1` заморожена. Правки схем аддитивные и версию каталога не меняют.
- `scripts/verify-public.ts` сверяет закоммиченный `public/` с исходником текущей версии и запускается в CI и перед деплоем Pages.
- `packages/catalog-react` даёт рендереры под тот же набор компонентов и примитивы (`./primitives`) для семейства `*Next`; экспортирует `ai37Catalog` для процессора A2UI.
- `packages/catalog-python` даёт Pydantic-модели (ручное зеркало Zod-схем), `validate_component_payload` / `validate_component_payload_json` / `get_component_schema`, а также пакет `ai37_a2ui_catalog.mcp_app` — Python-пару протокола «A2UI внутри MCP App».
- `packages/mcp-app-view` (`@ai37/a2ui-mcp-app`) — два слоя:
  - `src/protocol.ts` + `src/result.ts` — протокол версии 1 и помощники результата. Поверхность едет в `_meta["ai37/a2ui"]` результата инструмента, а не в `structuredContent` (текст для модели — в `content`). Поля конверта: `version`, `messages`, `surfaceId`, `state`, `actionTool`. `a2uiSurfaceMessages(node, surfaceId, catalogId)` собирает поток A2UI v0.9 из одного корневого узла (`createSurface` + `updateComponents` с `id: 'root'`); `a2uiAppResult({text, surfaceId, actionTool, state?, node | messages, catalogId?})` отдаёт готовый результат инструмента; `a2uiResourceResult(resource, text?)` — ответ ресурсного канала.
  - `src/view/*` — сам HTML-view: React + `App` из `@modelcontextprotocol/ext-apps`, `MessageProcessor` из `@a2ui/web_core/v0_9` с каталогом `ai37Catalog` и `A2uiSurface`. `startA2uiAppView` вешает обработчики `toolresult` / `hostcontextchanged` до `connect()`, рендерит `A2uiAppSurface` в контейнер и применяет тему хоста (`data-a2ui-theme = light | dark`) и стили (`applyHostStyleVariables`, `applyHostFonts`).
  - `A2uiAppSession`: хост присылает результат инструмента → поверхность рисуется заново (поток с `createSurface` создаёт новый `MessageProcessor`; поток без него — правка текущей поверхности, напр. `updateDataModel`). Действие поверхности уходит как `callServerTool(actionTool, {name, context, state})`; ответ того же формата перерисовывает поверхность, его текст уходит модели через `updateModelContext`. Действия `*:draft` и `LOOKUP_SUGGEST_ACTION` — «тихие»: без индикатора хода и без сообщения модели, черновик поверхность не пересоздаёт. Поздний ответ на более ранний запрос состояние не затирает (счётчики `issued`/`applied`).
  - Ресурсный канал: рендереры ходят same-origin `GET /api/agent-resource?resource=&query=`; в песочнице хоста такого origin нет, поэтому `installResourceFetch` подменяет `fetch` страницы и отправляет тот же запрос в `actionTool` как `resource:<id>` (остальные параметры — в `context`). Пустой ответ → 404 `{error: "unknown_resource"}`; отмена поддержана через `AbortSignal`.
  - Сборка view: `vite build` (single-file HTML) + `tsup` (ESM-библиотека) + `scripts/emit-entry.mjs`, который пишет `dist/html.js` со строкой `A2UI_MCP_APP_HTML`, склеивает `dist/index.js` и кладёт копию HTML в `packages/catalog-python/src/ai37_a2ui_catalog/mcp_app/a2ui-mcp-app.html` (в git не лежит, входит в колесо через `include` в `pyproject.toml`).
  - Ограничения размера: в view KaTeX заменён показом исходного TeX (`katex-plain.ts`), из zod 4 вырезаны неанглийские локали (плагин `zodEnglishOnly`). Бюджет HTML в тестах — 1 120 000 байт (сейчас ~1,10 МБ).
- Формат протокола совпадает у TS и Python байт в байт — это проверяет общая фикстура `tests/mcp-app/a2ui-app-result.fixture.json`.
- `ProposalSource.links` — необязательный список до 20 объектов `{label, href?}` (записи, из которых собрана пачка, напр. голосовые сообщения). Работает у обеих форм источника: у источника пачки и у источника пункта. Рендерер (`proposal-card-source-links.tsx`) ставит их после подписи/цитаты: с `href` (путь от корня хоста или http(s)) — ссылкой в новой вкладке, без `href` — подписью. Одиночный `href` сохранён; пустой список рисуется как отсутствие поля; одних `links` без подписи или цитаты по-прежнему мало. Python-зеркало: `ProposalSourceLink`, `ProposalSource.links`.
- Схемы источника — `.strict()`: рендерер 0.44.0 отклоняет источник с `links`, поэтому в хостах каталог бампают раньше, чем эмитент-агент начнёт слать поле.
- `ProposalCardScreen` (экран карточки пачки отдельно от рендерера) принимает проп `flat?: boolean` (по умолчанию `false`): при `flat` внешняя карточка рисуется как `Card flat`. Это проп хоста, а не поле A2UI-схемы; Zod-схемы, Python-зеркало и `public/` не менялись. Подвал считает `resolveProposalCardFooter` (`confirm` | `link` | `none`).

```mermaid
flowchart LR
    S[catalog-schemas: Zod] --> G[generate-artifacts.ts]
    G --> P[public/a2ui/catalogs/ai37-a2ui/v1, v2]
    P --> GH[GitHub Pages: catalog.json = catalogId]
    S --> R[catalog-react: рендереры + primitives]
    S -.зеркало.-> Py[catalog-python: Pydantic + mcp_app]
    S --> V[mcp-app-view: HTML view + протокол _meta]
    R --> V
    A[агенты] -->|a2uiAppResult / a2ui_app_result| M[_meta["ai37/a2ui"] результата инструмента]
    M --> V
    V -->|callServerTool actionTool: name, context, state| A
    U[UI-хост с catalog-react] -->|GET /api/agent-resource| BFF[BFF → оркестратор → агент]
```

Компоненты каталога: `SimpleTable`, `FlexTable`, `LatexFormula`, `ChoiceCard`, `AttachmentChoiceCard`, `FormCard`, `ConstructionsEditor(Next)`, `LiftEditor(Next)`, `ThermalReport(Next)`, `KeoEditor(Next)`, `KeoReport(Next)`, `InsolationEditor`, `InsolationReport`, `LiftReport(Next)`, `ArtifactCard`, `VerificationReport`, `ProposalCard`.

## Структура каталогов
- `packages/catalog-schemas/` — `@ai37/a2ui-catalog-schemas`: Zod-схемы (`src/components/`), каталог, константы, генерация артефактов.
- `packages/catalog-react/` — `@ai37/a2ui-catalog-react`: рендереры (`src/renderers/`, в т.ч. `proposal-card-screen.tsx`, `proposal-card.types.ts`), примитивы набора (`src/primitives/`).
- `packages/catalog-python/` — Python-пакет `ai37-a2ui-catalog` (`ai37_a2ui_catalog`: `models/`, `validation.py`, `constants.py`, `mcp_app/`).
- `packages/mcp-app-view/` — `@ai37/a2ui-mcp-app`: протокол и помощники (`src/protocol.ts`, `src/result.ts`, `src/index.ts`), HTML-view (`src/view/`, точка входа `a2ui-mcp-app.html`), конфиги `vite.config.ts` / `tsup.config.ts`, скрипт сборки `scripts/emit-entry.mjs`.
- `apps/demo/` — `@ai37/a2ui-demo`, Vite-стенд для ручной проверки сообщений (в т.ч. страницы `proba/` системы примитивов, мок-справочники).
- `fixtures/` — `valid/`, `invalid/`, `messages/` (поверхности A2UI) для тестов и демо; напр. `lift-editor-per-lift.json`, `lift-editor-recommend.json`, `proposal-card-voice-links.json`.
- `tests/` — `ts/`, `react/`, `mcp-app/` (Vitest: протокол, сессия view, подмена fetch, сборка HTML) и `python/` (pytest, включая `test_mcp_app.py`).
- `public/` — сгенерированные артефакты каталога для GitHub Pages (`a2ui/catalogs/ai37-a2ui/v1`, `v2`).
- `scripts/` — `bump-version.mjs` (в т.ч. `packages/mcp-app-view/package.json` и `uv lock`), `verify-public.ts`, `install-to-consumer.mjs`, `check-pr-release-metadata.mjs`.
- `docs/` — `theming.md`, `initial-plan.md`; `openspec/changes/` — спецификации изменений компонентов.

## Публичные интерфейсы
- Статический каталог на GitHub Pages: `https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json` (`CATALOG_ID`) и `.../v2/components/*.schema.json`; `v1` хранится рядом. В `proposal-card.schema.json` у источника (пачки и пункта) поля `label`/`quote`/`href`/`links`.
- npm:
  - `@ai37/a2ui-catalog-schemas` (экспорты `.`, `./constants`).
  - `@ai37/a2ui-catalog-react` (`.`, `./primitives`; peer `react`/`react-dom` ^19), в т.ч. `ProposalCardScreen`, `resolveProposalCardFooter`, `SurfaceReadOnlyProvider`, `useSurfaceReadOnly`, `withReadOnlyGate`.
  - `@ai37/a2ui-mcp-app` (`.`, `./a2ui-mcp-app.html`): `A2UI_MCP_APP_HTML` (строка однофайлового HTML), `A2UI_META_KEY = 'ai37/a2ui'`, `A2UI_APP_PROTOCOL_VERSION = 1`, `A2UI_RESOURCE_ACTION_PREFIX = 'resource:'`, типы `A2uiAppPayload`, `A2uiResourcePayload`, `A2uiAppActionArgs`, `A2uiAppMessage`, `A2uiNode`, `A2uiAppResultInput`, `A2uiAppToolResult`, `A2uiResourceToolResult`; функции `a2uiSurfaceMessages`, `a2uiAppResult`, `a2uiResourceResult`, `readA2uiAppPayload`, `readA2uiResource`, `parseResourceActionName`.
- PyPI: `ai37-a2ui-catalog`; `ai37_a2ui_catalog.mcp_app`: `html()` (тот же HTML из колеса), `a2ui_app_result`, `a2ui_resource_result`, `a2ui_surface_messages`, `parse_resource_action_name`, `A2UI_META_KEY`, `A2UI_APP_PROTOCOL_VERSION`, `A2UI_RESOURCE_ACTION_PREFIX`, `A2UI_MCP_APP_HTML_FILE`.
- Протокол «A2UI внутри MCP App» v1: `_meta["ai37/a2ui"]` результата инструмента = `{version: 1, messages, surfaceId, state, actionTool}`; ответ ресурсного канала = `{version: 1, resource}`; аргументы app-only инструмента = `{name, context, state}`. View отбрасывает чужой ключ, другую версию и битую форму.
- Контракт, который должен реализовать потребитель-хост: same-origin `GET /api/agent-resource?resource=&query=`. Неизвестный resource → 404 `{error: "unknown_resource"}`.
- A2A, AG-UI и HTTP-сервисов нет; MCP-сервер не реализуется — есть только view, который хост MCP Apps грузит как ресурс `ui://…` в песочницу (CSP закрыт).

## Зависимости в экосистеме
### Зависит от
- `@a2ui/react`, `@a2ui/web_core` 0.10.1 (базовый каталог A2UI).
- `@modelcontextprotocol/ext-apps` 2.0.4, `@modelcontextprotocol/client` ^2.4.0, `@modelcontextprotocol/core` ^2.4.0 — протокол MCP Apps во view.
- Приватные реестры `npm.app.sp-ai.ru` и `pypi.app.sp-ai.ru` (публикация; scope `@ai37` закреплён в `.npmrc`).
- В рантайме рендереров: BFF хоста с маршрутом `/api/agent-resource`. Во view этот маршрут не нужен — он подменяется вызовом `actionTool`. Authentik, БД и LLM не используются.

### От него зависят
- spai-ui и UI-форки (рендер), widget-ui, polimetrika-ui (в т.ч. передаёт `flat` в `ProposalCardScreen` — ревью AI-37/polimetrika-ui#45).
- spai-chat-backend и форки, `@ai37/agent-host` (ai37-agent-sdk) — `@ai37/a2ui-catalog-schemas`.
- Агенты: spai-elevator-calc-agent, spai-thermal-calc-agent, spai-daylight-factor-calc-agent, spai-consultant-agent, pdai-doc-gen-agent, pdai-site-check, polimetrika-data-agent (эмитент `ProposalCard`; для поля `links` нужен пин `ai37-a2ui-catalog==0.45.0` и выше — модель строгая).
- MCP-хосты и агенты, отдающие поверхность через `_meta["ai37/a2ui"]`: TS — через `a2uiAppResult` из `@ai37/a2ui-mcp-app`, Python — через `ai37_a2ui_catalog.mcp_app.a2ui_app_result` (формат идентичен).

## Конфигурация
`.env.example` нет.
- `AI37_NPM_TOKEN` — авторизация в `npm.app.sp-ai.ru`. Через `.npmrc` она нужна уже для `pnpm install` (в т.ч. при сборке view в CD).
- `AI37_PYPI_TOKEN` — пароль публикации в `pypi.app.sp-ai.ru` (CD).
- Переменные организации `CI_RUNNER` / `CD_RUNNER` — выбор раннера.
- Тематизация: CSS-токены `--a2ui-*` и атрибут `data-a2ui-theme` (см. `docs/theming.md`); view получает тему и стили от хоста MCP Apps (`applyHostStyleVariables`, `applyHostFonts`), а шрифт/цвета подписей берёт из переменных хоста с системными фолбэками.

## Данные и хранилища
БД, Redis и S3 нет. Хранятся только статические артефакты в `public/a2ui/catalogs/ai37-a2ui/{v1,v2}`, фикстуры в `fixtures/` и собранный HTML view: `packages/mcp-app-view/dist/a2ui-mcp-app.html` (в git не хранится) и его копия `packages/catalog-python/src/ai37_a2ui_catalog/mcp_app/a2ui-mcp-app.html` (в `.gitignore`, попадает в sdist/wheel через `include` в `pyproject.toml`).

## Быстрый старт (локально)
```bash
export AI37_NPM_TOKEN=...                       # нужен .npmrc для @ai37
pnpm install
poetry -C packages/catalog-python install
pnpm run demo                                   # Vite-стенд apps/demo
pnpm run build                                  # пакеты + demo; собирает и HTML view в packages/mcp-app-view/dist
pnpm run export:public && pnpm run verify:public  # перегенерировать и сверить public/
pnpm run version:bump <version>                 # синхронный бамп версии (включая packages/mcp-app-view)
pnpm run install:consumer                       # локальная сборка в spai-ui (или: keo teplo …)
```
Сборку view можно вызвать отдельно: `pnpm --filter @ai37/a2ui-mcp-app run build` (vite → tsup → `scripts/emit-entry.mjs`; печатает размер HTML в байтах и обновляет копию в Python-пакете). Отдельного health/smoke-эндпоинта нет.

## Как запускать тесты
```bash
pnpm run test          # vitest run + pytest (tests/python)
pnpm run test:ts       # vitest run tests/ts tests/react tests/mcp-app
pnpm run test:python   # poetry -C packages/catalog-python run pytest ../../tests/python
pnpm run lint          # = typecheck
```
Тесты `tests/mcp-app` и Python-тест `test_mcp_app.py` читают собранный HTML, поэтому перед ними нужен `pnpm run build` (в CI так и сделано). В `tests/mcp-app` проверяются: формат результата по общей фикстуре, ветки сессии view (порядок ответов, тихие действия, битый поток, сбой транспорта), подмена `fetch` для ресурсного канала, бюджет размера и однофайловость HTML (~1,10 МБ при лимите 1 120 000 байт).

## Деплой
Не деплоится как сервис.
- `ci.yml` (PR, одна джоба `ci-green`): `pnpm install --frozen-lockfile`, установка Python-пакета, затем `pnpm run build` (до тестов), `test:ts`, `test:python`, `verify:public`.
- `pages.yml`: на push в `main` при изменениях в `packages/catalog-schemas/**` (или вручную) выполняет `verify:public` и деплоит `public/` на GitHub Pages (`https://ai-37.github.io/ai37-a2ui-catalog/`).
- `cd.yml`: по тегу `v*` или вручную (`publish_npm`, `publish_pypi`) сначала переиспользует CI, затем публикует `pnpm publish` трёх npm-пакетов (`@ai37/a2ui-catalog-schemas`, `@ai37/a2ui-catalog-react`, `@ai37/a2ui-mcp-app`) в `https://npm.app.sp-ai.ru/`; для PyPI — ставит pnpm/Node, собирает view (`pnpm install --frozen-lockfile` + `pnpm --filter @ai37/a2ui-mcp-app run build`), затем `poetry build` + `twine check` + `twine upload` в `https://pypi.app.sp-ai.ru/`.
- Terraform и Helm не используются.

## Связанные документы
- `ecosystem/design/a2ui-negotiation-plan.md` — негоциация MIME → `catalogId` (`CATALOG_ID`, `A2UI_BASE_CATALOG_ID`).
- `ecosystem/v2/10-agui-protocol.md` — AG-UI/A2UI в чате.
- `ecosystem/design/frontend-stack.md`, `ecosystem/design/ui-principles-sp-ai.md` — фронтенд-основа.
- AI-37/docs `plans/mcp-apps-a2ui-bridge.md` — план «A2UI внутри MCP App» (протокол `_meta["ai37/a2ui"]`, ресурсный канал).
- `docs/theming.md` (в репозитории), `CHANGELOG.md` — история версий (0.48.0: `@ai37/a2ui-mcp-app` и `ai37_a2ui_catalog.mcp_app`; 0.46.0: проп хоста `flat` у `ProposalCardScreen`).
<!-- ai37:card:end -->

<!-- Ниже — только уникальный человеческий контекст (замысел, инварианты, грабли).
     Не дублируйте сюда «что/как» из карточки выше — её ведёт docs-bot из кода. -->

## Тема семейства `*Next`

Тему компонентов на наборе примитивов (`ConstructionsEditorNext`, `LiftEditorNext`,
`ThermalReportNext`, `LiftReportNext`) выбирает **хост**, а не компонент: в схемах и в
контракте A2UI темы нет. Каждый цветной токен набора несёт обе половины одним
значением — `light-dark(<светлое>, <тёмное>)`, — а какая половина читается, решает
наследуемое свойство `color-scheme`.

Три способа сказать своё слово, от знакомого к прямому:

```html
<!-- 1. Атрибут набора — на контейнере сообщения или на самом корне компонента -->
<div data-a2ui-theme="dark"><A2uiSurface … /></div>
```

```css
/* 2. Прямой color-scheme — если он у вас уже объявлен (next-themes, .dark и т.п.),
      делать не нужно ничего: набор возьмёт тему по наследованию. */
.dark { color-scheme: dark; }

/* 3. «Следовать системе» — осознанный шаг хоста, а не поведение по умолчанию. */
.chat { color-scheme: light dark; }
```

**Без слова хоста набор светлый** — даже при тёмной ОС. Это выбор: компонент живёт
внутри чужой ленты, и карточка, потемневшая сама по себе в светлом чате, — такой же
дефект, как светлая карточка в тёмном. Правду о теме знает поверхность.

Попап (справочник, список, меню) уезжает в портал, где предка с темой нет, — схему ему
доносит примитив от якоря. Если монтируете попап мимо примитивов каталога, тему
придётся донести самим.

Палитру можно переопределить, объявив токен `--a2ui-*` **на том же элементе `.a2ui-kit`
или ниже**: на предке не сработает — там объявление набора сильнее. Старые рендереры
живут на других токенах (`--a2ui-color-*`), их темизация описана в `docs/theming.md`.

## Adding Components

1. Add the canonical Zod schema in `packages/catalog-schemas/src/components/<component>.ts`.
2. Export the new definition from `packages/catalog-schemas/src/index.ts` and register it in `packages/catalog-schemas/src/catalog.ts` so it appears in `componentDefinitions` and the exported catalog artifact.
3. Add the React renderer in `packages/catalog-react/src/renderers/<component>.tsx` and register it from `packages/catalog-react/src/catalog.ts`.
4. Add the manual Pydantic model in `packages/catalog-python/src/ai37_a2ui_catalog/models/<component>.py`, then export it from `packages/catalog-python/src/ai37_a2ui_catalog/models/__init__.py` and `packages/catalog-python/src/ai37_a2ui_catalog/__init__.py` when it is part of the public API.
5. Add or update fixtures in `fixtures/messages` so the new component has realistic surface messages for tests and local verification.
6. Run `pnpm run test`, `pnpm run build`, and if you changed exported schemas also run `pnpm run export:schemas -- --output ./tmp/catalog-public`.

## Versioning

The repository uses a synchronized version for npm packages, the Python package, and the catalog artifacts. Use `pnpm run version:bump <version>` to update the tracked manifest versions in one pass.

Every pull request is expected to do two release bookkeeping updates together with the code change:

- bump the synchronized version before merge
- add a matching entry to `CHANGELOG.md` using the heading format `## [x.y.z] - YYYY-MM-DD`
