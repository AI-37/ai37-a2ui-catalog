# Tasks: ProposalCard

- [x] Схема `proposal-card.ts`, регистрация (`index.ts`, `constants.ts`, `catalog.ts`)
- [x] Рендерер `proposal-card*.tsx`, подвал `resolve-proposal-card-footer.ts`, регистрация без `withReadOnlyGate`
- [x] Python-зеркало `models/proposal_card.py`, `COMPONENT_MODELS`, экспорт
- [x] Фикстуры: valid ×3, invalid ×4
- [x] Тесты: схема, React (7 сценариев + подвал), Python (+ сверка JSON Schema)
- [x] Превью в `apps/demo`: список, таблица без задачи, заменённая пачка
- [x] `export:public`, `verify:public`, `version:bump 0.42.0`, `CHANGELOG.md`
- [x] Скриншоты в `preview/`: 720 и 360 px, светлая и тёмная
- [ ] Гейт глазами на стенде — владелец
- [ ] Публикация 0.42.0 — после «принято»
- [ ] `openspec archive proposal-card -y` после влития PR
