# Changelog

All notable changes to this repository should be recorded in this file.

The format follows Keep a Changelog with version headings in the form `## [x.y.z] - YYYY-MM-DD`.

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
