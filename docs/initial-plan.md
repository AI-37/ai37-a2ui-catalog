# Initial Plan: AI37 A2UI Catalog Monorepo

Текущий целевой вариант после упрощения архитектуры:

1. `packages/catalog-schemas` — единственный source of truth на TypeScript/Zod.
2. `packages/catalog-react` — React renderers, использующие те же schema definitions.
3. `packages/catalog-python` — hand-written Pydantic models, разбитые по одному файлу на компонент.
4. Консистентность между JS и Python доказывается тестом, а не кодогенерацией.
5. Repo не хранит generated schema artifacts; экспорт выполняется только по явной команде `pnpm run export:schemas -- --output <dir>`.
6. Публикационный namespace каталога: `https://a2ui-schemas.dev.ai37.ru`.

## Implementation Steps

1. Stabilize schema source. Держать все component definitions, catalog metadata и JSON Schema export в `packages/catalog-schemas`.
2. Keep React thin. В `packages/catalog-react` не дублировать схемы, а только импортировать definitions и renderer-specific code.
3. Keep Python manual. В `packages/catalog-python` поддерживать Pydantic-модели вручную в файлах `simple_table.py`, `flex_table.py`, `latex_formula.py` плюс общие `shared.py`, `constants.py`, `validation.py`.
4. Enforce parity by test. Сравнивать `model_json_schema()` c JSON Schema, экспортированной из JS через CLI/stdout, без промежуточных файлов в репозитории.
5. Preserve deployment path. Для image-based hosting использовать `pnpm run export:schemas -- --output <docroot>`, чтобы Docker image или chart могли собрать статический layout без commit-generated файлов.
6. Keep docs honest. Любые упоминания старого имени пакета, старого домена или Python codegen считать устаревшими и убирать.

## Relevant Files

- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-schemas/src/catalog.ts` — сборка catalog artifact и component schema export.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-schemas/src/generate-artifacts.ts` — явный CLI export в stdout или заданный output directory.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-react/src/catalog.ts` — React catalog assembly.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-python/src/ai37_a2ui_catalog/models/simple_table.py` — Pydantic model for `SimpleTable`.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-python/src/ai37_a2ui_catalog/models/flex_table.py` — Pydantic model for `FlexTable`.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/packages/catalog-python/src/ai37_a2ui_catalog/models/latex_formula.py` — Pydantic model for `LatexFormula`.
- `/home/cthtuf/Projects/AI37/ai37-a2ui-catalog/tests/python/test_schema_consistency.py` — JS vs Pydantic schema parity test.

## Verification

1. `pnpm run typecheck`
2. `pnpm run test:ts`
3. `pnpm run test:python`
4. Optional export smoke test: `pnpm run export:schemas -- --output ./tmp/catalog-public`

## Decisions

- Source of truth: only JS/Zod schemas.
- Python models: manual, no code generation.
- Repo artifacts: no committed generated outputs.
- Publication host: `a2ui-schemas.dev.ai37.ru`.
- Packaging: npm package `@ai37/a2ui-catalog-schemas`, React package `@ai37/a2ui-catalog-react`, PyPI package `ai37-a2ui-catalog`.