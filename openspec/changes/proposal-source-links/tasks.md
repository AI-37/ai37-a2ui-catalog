# Tasks: ссылки источника ProposalCard

- [x] Схема: `proposalSourceLinkSchema`, `ProposalSource.links`
- [x] Рендер: `proposal-card-source-links.tsx` в источнике пачки и пункта
- [x] Python-зеркало: `ProposalSourceLink`, `ProposalSource.links`
- [x] Фикстуры: valid `proposal-card-voice-links.json`, invalid `proposal-card-source-link-without-label.json`
- [x] Тесты: схема (+ JSON Schema), React (+ снапшот разметки), Python
- [x] Превью в `apps/demo`: отклонённая пачка со ссылками на записи
- [x] `export:public`, `version:bump 0.45.0`, `CHANGELOG.md`
- [ ] Публикация 0.45.0 — после «принято»
- [ ] Бамп в spai-ui (→ форки), polimetrika-ui (S7), polimetrika-data-agent (S6)
- [ ] `openspec archive proposal-source-links -y` после влития PR
