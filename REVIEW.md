<!-- Maintained for the AI-37 doc-bot PR reviewer. Repo-specific overlay; the common review
     contract (three lenses, false-positive rules, autonomy) is the bot's built-in prompt —
     canonical text in AI-37/docs plans/doc-bot-pr-review/reviews/_common.md. -->

# REVIEW.md — ai37-a2ui-catalog
> Inherits the common contract: reviews/_common.md (the bot loads it as the global default). This file covers only the repo-specific specifics.

**Role / stack / deploy:** the ecosystem's A2UI catalog — canonical Zod schemas + React renderers + Pydantic validation models + shared fixtures (TS/React 19/Zod/Vitest, Python 3/Pydantic/Poetry, pnpm monorepo). A library: it publishes 3 packages (`@ai37/a2ui-catalog-schemas`, `@ai37/a2ui-catalog-react` → npm.app.sp-ai.ru Verdaccio; Python `ai37-a2ui-catalog`) + a static catalog on GitHub Pages (`.github/workflows/pages.yml`). No Terraform/helm.

**Test command:** `pnpm run test` (= `vitest run` + `poetry -C packages/catalog-python run pytest ../../tests/python`). Pre-steps: `pnpm install` and `poetry -C packages/catalog-python install`. Slices: `pnpm run test:ts` (tests/ts + tests/react), `pnpm run test:python`. Lint/types: `pnpm run lint` (= `typecheck`). If a PR touches `packages/catalog-schemas/src/**` without updating the fixtures in `fixtures/` and a paired test — that is a finding (lens 1).

**Key invariants (what the reviewer must know):**
- **The schema is an interactive CONTRACT.** A component's Zod schema (`packages/catalog-schemas/src/components/<c>.ts`) is the API that agents emit and the UI renders. Any breaking change to a field/shape ripples across ALL consumers (chat-backend/UI + every agent that sends this component). The contract must not be broken or forked — only additively + a catalog version (`v1`/`v2` in `public/a2ui/catalogs/ai37-a2ui/`).
- **Triple parity is mandatory.** Per component there are three hand-written artifacts that must match: Zod schema ↔ Pydantic model (`packages/catalog-python/.../models/<c>.py`, written BY HAND) ↔ React renderer (`packages/catalog-react/src/renderers/<c>.tsx`). Python models are not generated from Zod → this is the main drift trap: a PR that changes a Zod field but leaves Pydantic untouched (or vice versa) passes tsc/mypy green yet desyncs the contract. Flag it (lens 2/3).
- **Registration in two places.** A new component must land both in `catalog-schemas/src/catalog.ts` (`componentDefinitions` → artifact) and in `catalog-react/src/catalog.ts` (renderer). A schema without registration is not in `catalog.json`; a renderer without registration is an "unknown component" in the UI.
- **Synchronized version + CHANGELOG are part of the release contract.** A single PR must: (1) bump the synchronized version via `pnpm run version:bump <x.y.z>` (npm packages + Python + artifacts in one shot), (2) add an entry to `CHANGELOG.md` in the format `## [x.y.z] - YYYY-MM-DD`. A PR that changes a schema/renderer without a bump+CHANGELOG is a finding.
- **Touch the `workspace:^` protocol carefully.** catalog-react → catalog-schemas are linked via `workspace:^` (not a semver range) deliberately: `^0.5.0` stopped matching after a schema bump and CI built react without the schemas. Replacing `workspace:*`/`workspace:^` with a fixed range is a regression — flag it.
- **Catalog artifacts are generated, not hand-edited.** `public/a2ui/catalogs/**/*.json` and `catalog.json` are the output of `generate-artifacts.ts` (`pnpm run export:schemas/export:public`). Hand-editing generated JSON without editing the source schema is a desync, and `verify:public` catches it.

**Lens 2 — what to check against (docs/ecosystem):**
- `ecosystem/v2/10-agui-protocol.md` — the AG-UI/A2UI protocol within which the catalog lives: the shape of A2UI messages, dispatch actions of form cards, catalog versioning. A schema change must conform to it.
- `ecosystem/v2/04-a2a-conventions.md` — if a component is tied to A2A output modes / `confirm_mode` / message-status (interactive confirmation cards).
- `openspec/changes/**/design.md` in the repo itself (e.g. `form-card-dispatch-action/design.md`) — the agreed design of a specific component; a PR must not contradict an accepted openspec change.

**Sensitive paths (in addition to the default):**
- `packages/catalog-schemas/src/components/**`, `packages/catalog-schemas/src/catalog.ts`, `packages/catalog-schemas/src/index.ts` — the public schema contract (breaking → human).
- `packages/catalog-python/src/ai37_a2ui_catalog/**` and the `packages/catalog-react/src/**` public exports — the packages' public API.
- Any `version` bump in `package.json`/`pyproject.toml` (the synchronized version of the published packages) and `scripts/bump-version.mjs`.
- `pnpm-workspace.yaml`, the `pnpm` overrides in the root `package.json` (`@a2ui/react`/`@a2ui/web_core` pinned to 0.10.1), `.npmrc`, `publishConfig.registry`.
- `public/a2ui/catalogs/**` (artifacts published to GitHub Pages), `.github/workflows/pages.yml`.

**Autonomy threshold (refinement):** this is a published contract library. NEVER auto-approve: (1) a breaking/incompatible change to a Zod schema or a package's public export; (2) any bump of the synchronized version; (3) a change to the `pnpm` `@a2ui/*` overrides or `publishConfig`/registry; (4) an edit to the generated catalog artifacts. All of this — `comment` + escalate to a human. A missing paired update Pydantic↔Zod↔renderer, or a missing CHANGELOG/bump when the contract changes → `request_changes`.

Write the review summary and all inline comments in RUSSIAN (the developers read Russian); these instructions are in English only for your understanding.
