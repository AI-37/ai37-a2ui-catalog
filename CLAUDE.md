<!-- ai37:context:start (managed by doc-bot — do not edit inside) -->
# ai37-a2ui-catalog

Каталог A2UI для экосистемы AI-37: канонические схемы компонентов, React-рендереры, Pydantic-модели, фикстуры и тесты; артефакты публикуются на GitHub Pages.

Стек: TypeScript, React 19, Zod, @a2ui/react, Vite/Vitest, tsup, Python/Pydantic, Poetry, pnpm.

Команды:
- install: pnpm install; poetry -C packages/catalog-python install
- build: pnpm run build
- test: pnpm run test, pnpm run test:ts, pnpm run test:python
- lint: pnpm run lint
- export: pnpm run export:schemas -- --output ./tmp/catalog-public
- deploy: GitHub Pages через .github/workflows/pages.yml (отдельной команды нет)

Полная карточка — блок ai37:card в README
Архитектура экосистемы — репозиторий AI-37/docs (ecosystem/…)
Процедуры — скиллы /ai37
<!-- ai37:context:end -->
