# Tasks: VerificationReport

- [x] Схема `packages/catalog-schemas/src/components/verification-report.ts`, регистрация (`index.ts`, `constants.ts`, `catalog.ts`)
- [x] Рендерер `verification-report*.tsx` на примитивах, регистрация в `catalog-react` (`catalog.ts`, `index.ts`)
- [x] `ReportNextVerdict` расширен до `pass | fail | warning`
- [x] Python-зеркало `models/verification_report.py`, `COMPONENT_MODELS`, экспорт
- [x] Фикстуры: valid ×3, invalid ×2
- [x] Тесты: `tests/ts/verification-report-schema.test.ts`, `tests/react/verification-report.test.tsx`, `tests/python` (+ сверка JSON Schema)
- [x] Превью в `apps/demo` (полная и точечная проверка)
- [x] `pnpm run export:public`, `verify:public`
- [x] `version:bump 0.40.0`, `CHANGELOG.md`
- [x] Скриншоты в `preview/`: `review-720.png`, `review-360.png` (две ширины контейнера) и `single-720.png`
- [ ] Гейт глазами — владелец
- [ ] Публикация 0.40.0 (`cd.yml`, `workflow_dispatch`) — разработчик
- [ ] `openspec archive verification-report -y` после влития PR
