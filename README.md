# AI37 A2UI Catalog

<!-- ai37:card:start (managed by doc-bot — do not edit inside) -->
# ai37-a2ui-catalog

## Описание

Монорепозиторий каталога A2UI для экосистемы AI-37: канонические Zod-схемы компонентов, React-рендереры, Pydantic-модели валидации, общие фикстуры и тесты. Артефакты каталога публикуются на GitHub Pages и используются для отрисовки и валидации A2UI-сообщений. В составе — доменные карточки результатов расчётов: `ThermalReport` (теплотехнический расчёт по СП 50.13330) и `LiftReport` (расчёт лифтов по ГОСТ Р 52941-2008 / ГОСТ 34758-2021): вердикт с бейджем, блок рекомендаций/проверок, исходные данные по источникам и свёрнутый протокол со «Скачать».

## Стек

TypeScript, React 19, Zod, @a2ui/react (overrides: 0.10.1), Vite, Vitest, tsup, tsx, Python 3.13+ + Pydantic, Poetry 2.3.2, Twine, pnpm (>=10, packageManager pnpm@10.29.3), Node >=22. Версия пакетов workspace — 0.25.0. Публикация пакетов — в приватные реестры AI-37 (npm.app.sp-ai.ru и pypi.app.sp-ai.ru). Константа дебаунса автодрафта условий `CONDITIONS_DRAFT_DEBOUNCE_MS = 500` мс экспортируется из @ai37/a2ui-catalog-react.

## Схема работы

Workspace состоит из пакетов:
- packages/catalog-schemas — канонические Zod-схемы, метаданные каталога, генерация JSON Schema и артефактов каталога;
- packages/catalog-react — React-рендереры и регистрация компонентов в каталоге;
- packages/catalog-python — Pydantic-модели и валидация на стороне Python;
- apps/demo — Vite-приложение для ручной проверки A2UI-сообщений;
- fixtures — общие валидные, невалидные и сквозные фикстуры сообщений.

Поток данных: схемы → generate-artifacts.ts → catalog.json и component schemas → public/a2ui/catalogs → GitHub Pages. React-рендереры и Pydantic-модели подключаются к тем же компонентам; тесты и демо используют фикстуры.

`ThermalReport` зарегистрирован в обоих пакетах: zod-схема `components/thermal-report.ts` (strict-объекты; обязательны `verdict` и `inputs`, режим «одна конструкция / список» определяется по наличию секций без флага; единственное число в props — `deviationPct`, остальное — готовые строки) и рендерер `renderers/thermal-report*.tsx/.ts` (корень, verdict, checks, constructions, inputs, layers-table, protocol, styles, action-button, format-deviation-pct). Кнопки-действия диспатчат агенту `{event: {name, context: payload ?? {}}}` через `context.dispatchAction`; «Протокол расчёта» — одна неразворачиваемая строка: лейбл, meta и при `downloadFileName` кнопка «Скачать». Краткий вывод `content` в UI не показывается — он остаётся fallback-содержимым скачивания при отсутствии `downloadContent`. «Скачать» отдаёт клиентским Blob'ом `downloadContent` (полную markdown-простыню; без него — `content`), агент и транспорт не участвуют; без `downloadFileName` кнопка не рендерится. Кнопка действия блока «Исходные данные» использует вариант `link`. Стили — `THERMAL_REPORT_CSS` с префиксом `a2ui-tr-`, цвета — токены группы `tr` (INHERITS на общие токены, как `ce`/`le`). Демо содержит два примера (одна конструкция / 7 конструкций), собранные из `fixtures/valid/thermal-report-*.json` через `create-thermal-report-messages.ts`; действия логируются `attachDemoActionLogger`.

`LiftReport` зарегистрирован в zod-каталоге и React-каталоге: zod-схема `components/lift-report.ts` (strict-объекты; обязательны `verdict` и `inputs`, `suggestions` и `protocol` опциональны) и рендерер `renderers/lift-report*.tsx/.ts` (корень, verdict, suggestions, inputs, protocol, action-button, chevron, styles). Python-зеркала нет — как у `ThermalReport`. Секции:
- `verdict` — статусный бейдж с точкой (status `pass`/`fail`), serif-headline, опциональный `summary`;
- `suggestions` («Что изменить») — варианты с уже пересчитанным результатом в `detail`; элемент с `action` рендерит кнопку «Пересчитать», без `action` — `statusLabel` тоном (`fail` — danger), `tone: 'pass'` выделяет рекомендуемый вариант акцентной рамкой;
- `inputs` — контракт идентичен `ThermalReport.inputs` (`{action?, groups: [{label, tone: 'normal'|'warning', chips: [{label, value}], note?}]}`): кнопка `action` в заголовке, группа `tone: 'warning'` — пунктирные чипы, предупреждающий заголовок и note;
- `protocol` — нативный `<details>`, свёрнутый по умолчанию: строка-сводка (лейбл, `meta`, шеврон) раскрывает краткий вывод `content`; при заданном `downloadUrl` рендерится ссылка «Скачать» (обычный `<a href>` на относительный `/api/agent-resource?resource=…`), download-заголовки ставит сервер агента, клиентский Blob не используется; без `downloadUrl` ссылки нет.

Действия диспатчатся как `{event: {name, context: payload ?? {}}}`; канонические имена в фикстуре — `report_apply_suggestion` (payload `{suggestionId}`) и `report_edit_inputs`. Стили — `LIFT_REPORT_CSS` с префиксом `a2ui-lr-`, цвета — токены группы `lr` (INHERITS на общие). Демо собирает поверхность из `fixtures/valid/lift-report.json` через общий `createSurfaceMessages` (отдельный `create-lift-report-messages.ts` удалён); действия логируются `attachDemoActionLogger`.

```mermaid
flowchart LR
    S[packages/catalog-schemas] --> G[generate-artifacts.ts]
    G --> P[public/a2ui/catalogs]
    P --> GH[GitHub Pages]
    S --> R[packages/catalog-react]
    S --> Py[packages/catalog-python]
    F[fixtures] --> T[tests and demo]
    R --> D[apps/demo]
```

## Структура каталогов

- apps/demo — Vite-приложение для ручной проверки A2UI-сообщений; dev-middleware мокает fetch-справочники lookup; логгеры черновиков/действий; примеры Thermal Report (single/multi) через `create-thermal-report-messages.ts` и Lift Report через общий `create-surface-messages.ts`;
- packages/catalog-schemas — канонические Zod-схемы, типы и генерация JSON Schema (включая `components/thermal-report.ts`, `components/lift-report.ts` и регистрацию в `CATALOG_COMPONENT_NAMES`, `constants.ts`, `catalog.ts`, `index.ts`);
- packages/catalog-react — React-рендереры компонентов каталога (в т.ч. `renderers/thermal-report*.tsx/.ts`, `renderers/lift-report*.tsx/.ts`, `thermal-report-protocol.tsx`, `lift-report-protocol.tsx`, группы токенов `tr` и `lr` в `tokens.ts`);
- packages/catalog-python — Pydantic-модели валидации (зеркало zod-схем);
- fixtures — валидные, невалидные и сквозные фикстуры A2UI-сообщений (включая `valid/thermal-report-single.json`, `valid/thermal-report-multi.json`, `valid/lift-report.json`);
- tests — тесты (tests/react — Vitest, включая `thermal-report.test.tsx`, `lift-report.test.tsx`; tests/ts — включая `thermal-report-schema.test.ts`, `lift-report-schema.test.ts`; python-часть — Pytest);
- public/a2ui/catalogs — статические артефакты каталога (catalog.json, JSON Schema компонентов, включая `components/thermal-report.schema.json` и `components/lift-report.schema.json`) для GitHub Pages;
- scripts/install-to-consumer.mjs — установка локальной сборки пакетов в потребителя тарболлами;
- .github/workflows — CI/CD (pages.yml, ci.yml, cd.yml);
- .npmrc — scoped-реестр @ai37 и авторизация для npm.app.sp-ai.ru;
- docs, openspec — документация и design-доки (включая openspec/changes/thermal-report, openspec/changes/lift-report и прежние changes).

## Публичные интерфейсы

Статический A2UI-каталог, публикуемый на GitHub Pages:
- catalog.json: https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v2/catalog.json
- JSON Schema компонентов: .../a2ui/catalogs/ai37-a2ui/v2/components/*.schema.json (включая `thermal-report.schema.json` и `lift-report.schema.json`) и аналогично для v1.

Отдельных публичных HTTP/REST-эндпоинтов, A2A Agent Card (/a2a/v1), MCP-сервера, AG-UI-сервера и CLI наружу нет. Внутренний fetch-канал подсказок lookup-полей — same-origin `GET /api/agent-resource?resource=&query=` (resource = id справочника / `field.referenceId`; BFF потребителя проксирует на REST оркестратора). В dev-middleware apps/demo неизвестный resource — 404 `{error: 'unknown_reference'}` (changelog 0.12.0 объявляет контрактный код `unknown_resource`). npm-пакеты workspace (catalog-schemas, catalog-react) публикуются в приватный npm-реестр AI-37 (npm.app.sp-ai.ru), Python-пакет ai37_a2ui_catalog — в приватный PyPI (pypi.app.sp-ai.ru); публичным наружу остаётся статический каталог на GitHub Pages.

В составе каталога v2 — компонент `ThermalReport` (read-mostly): секции `verdict` (обязателен), `checks`/`layersTable` (режим одной конструкции), `constructions`/`excluded`/`assumptions` (режим списка), `inputs` (обязателен), `protocol`. Действия — объект `{name, label, payload?}`; имя в схему не зашито, в фикстурах канонические `report_fix_construction` (payload `{constructionId}`), `report_edit_inputs`, `report_restore_excluded`. Чип отклонения форматируется самим рендерером по знаку `deviationPct`: «−23,3 %» / «+0,6 %» (типографский минус, десятичная запятая, один знак). Группа исходных данных с `tone: 'warning'` («принято системой — проверьте») отличается пунктирными чипами, предупреждающим заголовком и `note`. Протокол — одна неразворачиваемая строка: `content` в UI не показывается; при заданном `downloadFileName` кнопка «Скачать» отдаёт `downloadContent` (полную markdown-простыню, maxLength 120000; без него — `content`) клиентским Blob'ом; без `downloadFileName` кнопка не рендерится.

Компонент `LiftReport` (read-mostly): обязательны `verdict` ({status: 'pass'|'fail', badge, headline, summary?}) и `inputs` (контракт идентичен `ThermalReport.inputs`); опциональны `suggestions` ({title?, items: [{id, title, detail?, tone: 'pass'|'fail'|'neutral', action?, statusLabel?}]}) и `protocol` ({meta?, content, downloadUrl?}). Вердикт рендерится бейджем со статусной точкой (pass — success, fail — danger), serif-headline и summary. В «Что изменить» элемент с `action` рендерит кнопку «Пересчитать» (диспатч `report_apply_suggestion` c `context.suggestionId`), без `action` — статус-лейбл тоном; `tone: 'pass'` — акцентная рамка рекомендуемого варианта. `inputs.action` рендерит кнопку «Изменить и пересчитать» (диспатч `report_edit_inputs`), группа `tone: 'warning'` — пунктирные чипы, warning-заголовок и note. Протокол — нативный `<details>`, раскрывает краткий `content` (maxLength 60000); «Скачать» — обычная ссылка на относительный `downloadUrl` (`/api/agent-resource?resource=…`, maxLength 2000), download-заголовки ставит сервер агента; без `downloadUrl` ссылки нет. Имена действий схема не фиксирует.

## Зависимости в экосистеме

### Зависит от

- npm-пакеты @a2ui/react и @a2ui/web_core (overrides: 0.10.1), а также workspace-пакеты: catalog-react зависит от catalog-schemas, demo — от catalog-react и catalog-schemas;
- React 19, Zod, Vite/Vitest, tsup, tsx;
- Python 3.13+, Pydantic, Poetry 2.3.2, Twine;
- при сборке/публикации — приватные реестры AI-37: npm.app.sp-ai.ru (npm) и pypi.app.sp-ai.ru (PyPI), а также токены AI37_NPM_TOKEN / AI37_PYPI_TOKEN;
- в fetch-режиме lookup — same-origin `/api/agent-resource`, который BFF потребителя проксирует на REST оркестратора (тот резолвит resource в ручку агента-владельца справочника); для скачивания протокола `LiftReport` по `downloadUrl` сервер агента ставит `Content-Disposition: attachment`;
- внешние сервисы (Authentik, LiteLLM, БД, Redis, S3) в рантайме не используются.

### От него зависят

По материалам репозитория прямые вызовы не перечислены; артефакты каталога предназначены для A2UI-потребителей экосистемы AI-37 (UI-рендереры и валидация сообщений). Рендерер ConstructionsEditor рассчитан на агента teplo-calc; proposal `constructions-editor-live-draft` отмечает потребителей spai-teplo-calc, spai-chat-backend и spai-ui — без изменений. Компонент `ThermalReport` рассчитан на агента spai-teplo-calc как эмитента отчёта (парный change `thermal-report` там) и на spai-ui как потребителя (bump schemas+react после publish). Компонент `LiftReport` рассчитан на агента spai-elevator-calc-agent как эмитента отчёта (парный change `lift-report-render` там) и на spai-ui как потребителя (bump schemas+react после publish); для «Скачать» требуется ручка агента с download-заголовками (spec `report-download` elevator-агента) и прохождение относительного URL через санитайзер spai-ui.

## Конфигурация

Явного .env.example нет. Используются переменные окружения:
- AI37_NPM_TOKEN — токен авторизации для приватного npm-реестра npm.app.sp-ai.ru (задан в .npmrc и в CI/CD);
- AI37_PYPI_TOKEN — токен (password) для публикации Python-пакета через Twine на pypi.app.sp-ai.ru (в cd.yml).

Скоуп @ai37 закреплён за npm.app.sp-ai.ru в .npmrc (always-auth=true). Версии пакетов синхронизируются через `pnpm run version:bump <version>` (текущая версия — 0.25.0); каждый PR также обновляет CHANGELOG.md. Доступные npm-скрипты: pnpm run build, typecheck, test, test:ts, test:python, export:schemas, export:public, verify:public, lint, demo, version:bump, install:consumer. Константа `CONDITIONS_DRAFT_DEBOUNCE_MS = 500` мс экспортируется из @ai37/a2ui-catalog-react (не env; используется тестами и хостами для единого окна дебаунса). Конфигурация: package.json (включая overrides), tsconfig.base.json, vitest.config.ts, vite.config.ts, pyproject.toml. Тематизация рендереров — через CSS-переменные (tokens.ts), включая токены групп `tr`/`lr` и общие статусные danger/success/warning для ThermalReport и LiftReport.

## Данные и хранилища

БД, Redis и S3 отсутствуют. Статические артефакты каталога: public/a2ui/catalogs/ai37-a2ui/v1 и v2 (в v2 `components/thermal-report.schema.json`, `components/lift-report.schema.json` и catalog.json перегенерированы; для LiftReport JSON Schema отражает strict-контракт с обязательными `verdict` и `inputs`). Фикстуры: fixtures/valid (включая thermal-report-single.json, thermal-report-multi.json — в protocol `content` и `downloadContent`; lift-report.json — с `verdict`, `suggestions`, `inputs`, `protocol` c `downloadUrl`), fixtures/invalid, fixtures/messages.

## Быстрый старт (локально)

Установка зависимостей:
- AI37_NPM_TOKEN должен быть доступен в окружении (см. .npmrc) — pnpm install обращается к npm.app.sp-ai.ru;
- `pnpm install` — зависимости workspace (pnpm >= 10, Node >= 22);
- `poetry -C packages/catalog-python install` — Python-пакет ai37-a2ui-catalog.

.env.example отсутствует — других env-переменных нет. Отдельного health-check нет; smoke-проверка после установки — `pnpm run test`. Демо-приложение: `pnpm run demo` (Vite + dev-middleware с мок-справочниками) для ручной проверки A2UI-сообщений; в демо доступны примеры Thermal Report (одна конструкция и список из 7 конструкций) и Lift Report (действия видны в консоли). Локальная проверка в потребителе без публикации: `pnpm run install:consumer [путь]` (по умолчанию ../spai-ui) — собирает тарболлы пакетов и ставит их в consumer через npm install --no-save.

## Как запускать тесты

Предварительно: `pnpm install` и `poetry -C packages/catalog-python install`.
- `pnpm run test` — vitest + pytest;
- `pnpm run test:ts` — только TypeScript/React-тесты (включая constructions-editor.test.tsx, lookup-option-rich-render.test.tsx, thermal-report.test.tsx, lift-report.test.tsx, thermal-report-schema.test.ts, lift-report-schema.test.ts, parse-lookup-options.test.ts);
- `pnpm run test:python` — только Python-тесты;
- `pnpm run lint` — typecheck.

## Деплой

GitHub Actions:
- .github/workflows/pages.yml публикует статические артефакты (включая обновлённые v2 с thermal-report.schema.json и lift-report.schema.json) на GitHub Pages;
- .github/workflows/ci.yml — CI-проверки. Запускается на pull_request, workflow_dispatch и workflow_call (push-триггер снят). При ручном запуске input `runner` позволяет выбрать раннер: `ubuntu-latest` (по умолчанию) или `ai37-self-hosted` → `runs-on: ["self-hosted", "ai37-local-1"]`. На PR и без input `runner` джобы идут на ubuntu-latest. Шаги: checkout, pnpm 10.29.3, Node 22, Python 3.13, Poetry 2.3.2, `pnpm install --frozen-lockfile` (с AI37_NPM_TOKEN), `poetry -C packages/catalog-python install --no-interaction`, `pnpm run test:ts`, `pnpm run test:python`, `pnpm run build`, `pnpm run verify:public`. Шаг «Validate PR version and changelog updates» временно закомментирован.
- .github/workflows/cd.yml — CD на push тегов v* или workflow_dispatch:
  - publish_npm: pnpm build и публикация @ai37/a2ui-catalog-* в приватный реестр https://npm.app.sp-ai.ru/ (токен AI37_NPM_TOKEN);
  - publish_pypi: poetry build + twine check dist/* + twine upload в https://pypi.app.sp-ai.ru/ (TWINE_USERNAME=ci-publish, TWINE_PASSWORD=AI37_PYPI_TOKEN). Poetry 2.3.2 ставится до setup-python (cache: poetry); run-шаги выполняются из packages/catalog-python.

Публичный хост: https://ai-37.github.io/ai37-a2ui-catalog/. Terraform/helm не используются.

## Связанные документы

- ecosystem/v2/10-agui-protocol.md — протокол AG-UI/A2UI, в контексте которого существует каталог;
- docs/theming.md;
- docs/initial-plan.md;
- openspec/changes/constructions-editor-live-draft/design.md, proposal.md, specs/constructions-editor-draft/spec.md, tasks.md;
- openspec/changes/lookup-option-rich-render/design.md, proposal.md, specs/lookup-option-rich-render/spec.md, specs/form-card-lookup-fetch-mode/spec.md;
- openspec/changes/form-card-dispatch-action/design.md;
- openspec/changes/pending-nav-single-open/design.md, proposal.md, specs/constructions-editor-pending-nav/spec.md, tasks.md;
- openspec/changes/instant-rpr-recalc/design.md, proposal.md, specs/constructions-editor-inline-layers/spec.md, specs/constructions-editor-rpr-preview/spec.md, tasks.md;
- openspec/changes/thermal-report/design.md;
- openspec/changes/thermal-report/proposal.md;
- openspec/changes/thermal-report/specs/thermal-report-component/spec.md;
- openspec/changes/thermal-report/tasks.md;
- openspec/changes/lift-report/design.md;
- openspec/changes/lift-report/proposal.md;
- openspec/changes/lift-report/specs/lift-report-component/spec.md;
- openspec/changes/lift-report/tasks.md.
<!-- ai37:card:end -->

<!-- Ниже — только уникальный человеческий контекст (замысел, инварианты, грабли).
     Не дублируйте сюда «что/как» из карточки выше — её ведёт docs-bot из кода. -->

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
