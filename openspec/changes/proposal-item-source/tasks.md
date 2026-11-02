# Tasks: источник у пункта ProposalCard

- [x] Схема: `ProposalItem.source`, `ProposalSource` (`quote?`, `href?`, «подпись или цитата»)
- [x] Рендер: `proposal-card-item-source.tsx`, `proposal-card-source-label.tsx`, список и таблица; `isProposalHref`
- [x] Python-зеркало: `ProposalItem.source`, `ProposalSource.validate_label_or_quote`
- [x] Фикстуры: valid `proposal-card-documents.json`, invalid ×2
- [x] Тесты: схема, React, Python (+ сверка JSON Schema)
- [x] Превью в `apps/demo`: параметры из документации
- [x] `export:public`, `verify:public`, `version:bump 0.44.0`, `CHANGELOG.md`
- [x] Скриншоты в `preview/`: 720 и 360 px, светлая и тёмная
- [ ] Публикация 0.44.0 — после «принято»
- [ ] Бамп в spai-ui (→ форки), polimetrika-ui, polimetrika-data-agent
- [ ] `openspec archive proposal-item-source -y` после влития PR
