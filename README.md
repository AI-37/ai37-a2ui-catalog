# AI37 A2UI Catalog

Monorepo with a custom A2UI catalog, React renderers, Python validation models, shared fixtures, tests, and deployment assets for publishing catalog artifacts on GitHub Pages (`https://ai-37.github.io/ai37-a2ui-catalog/`).

## Workspace

- `packages/catalog-schemas` — canonical Zod schemas, catalog metadata, JSON Schema export, and A2UI catalog artifact export.
- `packages/catalog-react` — React renderers and A2UI catalog for `@a2ui/react/v0_9`.
- `packages/catalog-python` — Pydantic models and Python-side validation helpers.
- `apps/demo` — Vite demo for manual verification of A2UI messages.
- `fixtures` — shared valid, invalid, and end-to-end message fixtures.

Catalog artifacts (`catalog.json` + component schemas) are published to GitHub Pages by
`.github/workflows/pages.yml`; the resolvable `catalogId` lives at
`https://ai-37.github.io/ai37-a2ui-catalog/a2ui/catalogs/ai37-a2ui/v1/catalog.json`.

## Commands

- `pnpm install`
- `poetry -C packages/catalog-python install`
- `pnpm run export:schemas -- --output ./tmp/catalog-public`
- `pnpm run build`
- `pnpm run test`
- `pnpm run demo`

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
