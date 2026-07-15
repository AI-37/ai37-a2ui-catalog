# Changelog

All notable changes to this repository should be recorded in this file.

The format follows Keep a Changelog with version headings in the form `## [x.y.z] - YYYY-MM-DD`.

## [0.7.0] - 2026-07-15

### Added

- Новый компонент `HtmlTable` — доверенный рендер таблицы, хранимой как HTML
  (нормативные документы: СП/ГОСТ). В отличие от `FlexTable` (строковые ячейки)
  сохраняет полную верность исходной таблицы: объединённые ячейки
  (rowspan/colspan), вложенный контент, сноски — за счёт нативного `<table>`.
  HTML санитизируется рендерером (DOMPurify: вырезаются script/on*/style/embeds,
  стили документа не протекают в приложение); тема задаётся через `--a2ui-*`
  токены (scoped по `.a2ui-html-table`). Рассчитан на HTML из доверенного
  индекса документов, НЕ на произвольный HTML от LLM.
  - `@ai37/a2ui-catalog-schemas`: `htmlTablePropsSchema`, `htmlTableDefinition`,
    тип `HtmlTableProps`; `'HtmlTable'` в `CATALOG_COMPONENT_NAMES`.
  - `@ai37/a2ui-catalog-react`: рендерер `HtmlTable` (зависимость `dompurify`).
  - `ai37_a2ui_catalog` (Python): модель `HtmlTableProps`.
- Изменение аддитивное — `CATALOG_ID` остаётся `v2` (набор компонентов —
  строгое надмножество). Существующие сообщения и негоциация не меняются;
  потребители получают компонент, бампнув версию пакета.

## [0.6.0] - 2026-07-14

### Added

- FormCard lookup: второй режим подсказок `suggestMode: 'fetch'` (change
  `form-card-lookup-fetch-e2e`). Поле с `suggestMode: 'fetch'` запрашивает
  опции само — debounced `GET /api/reference-suggest?referenceId=&query=`
  (same-origin, через BFF потребителя → оркестратор → REST-ручка
  агента-владельца справочника) с отменой in-flight (`AbortController`) и
  тихим fallback на любой сбой. Дефолт (`suggestMode` не задан) — прежний
  action-канал `lookup:suggest`, поведение существующих сообщений не
  меняется.
- `@ai37/a2ui-catalog-schemas`: `lookupSuggestModeSchema`,
  `LOOKUP_SUGGEST_ROUTE`, `LOOKUP_DEBOUNCE_MS`, тип `LookupSuggestResponse` —
  единый источник контракта fetch-канала для BFF/оркестратора/агентов.
- `@ai37/a2ui-catalog-react`: рендерер lookup разобран на диспетчер
  (`lookup-field`), `lookup-field-action`, `lookup-field-fetch` и общий
  презентационный `lookup-combobox`.
- Python-модель (`ai37-a2ui-catalog`): `LookupSuggestMode`,
  `FormField.suggestMode` — зеркало zod-схемы.
- Демо: dev-middleware `/api/reference-suggest` (vite) и превью fetch-режима.

## [0.3.1] - 2026-06-21

### Fixed

- `@ai37/a2ui-catalog-react` FormCard: submit-кнопка теперь канонически диспатчит
  action со значениями полей через `context.dispatchAction({event:{name, context}})`
  → значения долетают агенту в `userAction.context`. Раньше кнопка ставила
  `data-action`-атрибут без обработчика — action не отправлялся (требовал костыля
  у потребителя). Схема FormCard не изменена. `catalog-react` 0.4.2 → 0.4.3.

## [0.3.0] - 2026-06-17

### Added

- `A2UI_BASE_CATALOG_ID` — id базового каталога A2UI (`basicCatalog`), для content-negotiation вывода (`@ai37/agent-sdk`): MIME `application/vnd.a2ui+json` → base, `application/vnd.a2ui.ai37+json` → `CATALOG_ID`.
- Workflow `pages.yml`: публикация артефактов каталога на GitHub Pages.

### Changed

- **BREAKING:** хостинг каталога переехал на GitHub Pages — `CATALOG_BASE_URL`/`CATALOG_ID` теперь `https://ai-37.github.io/ai37-a2ui-catalog/...` (было `a2ui-schemas.dev.ai37.ru`). `catalogId` в каждом A2UI-payload меняется соответственно.

### Removed

- Старый способ хостинга артефактов: `Dockerfile`, `.dockerignore`, `chart/` (Helm) и CD-джобы `publish_container`/`deploy` — заменены публикацией на GitHub Pages.

## [0.2.1] - 2026.06.14

### Changed

- Replace hardcoded colors with tokens with further theming support

## [0.2.0] - 2026-06-13

### Added

- Interactive human-in-the-loop components `ChoiceCard` (single/multi select) and `FormCard` (typed fields) across all three layers: canonical Zod schemas, React renderers, and Python Pydantic models.
- Valid and invalid fixtures plus surface messages for the new components, with matching TypeScript, React, and Python tests.

## [0.1.0] - 2026-06-02

### Added

- Initial AI37 A2UI catalog monorepo with shared Zod schemas, React renderers, and Python validation models.
- Schema export CLI, static Docker image, and Helm chart for publishing catalog artifacts on `a2ui-schemas.dev.ai37.ru`.
- Cross-language test coverage for TypeScript renderers, Python models, and schema consistency.
- GitHub Actions CI and CD workflows for validation, publishing, and deployment automation.
