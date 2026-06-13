# Changelog

All notable changes to this repository should be recorded in this file.

The format follows Keep a Changelog with version headings in the form `## [x.y.z] - YYYY-MM-DD`.

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
