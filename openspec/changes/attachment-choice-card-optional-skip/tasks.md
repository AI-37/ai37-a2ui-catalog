# Tasks: AttachmentChoiceCard — необязательный `skip`

- [x] Схема: `skip` `.optional()`, `description` определения
- [x] Python-зеркало: `skip` по умолчанию `None`
- [x] Рендерер: `attachment-choice-card-skip-button.tsx` с ранним `return null`; тип `AttachmentChoiceCardSkipButtonProps`
- [x] Фикстура `attachment-choice-card-attach-only.json`, превью в demo
- [x] Тесты: схема без `skip`, React — одна кнопка и attach-payload, Python
- [x] `export:public`, `verify:public`, `version:bump 0.42.0`, `CHANGELOG.md`
- [x] Гейт макета — SSR-превью состояний, «принято» владельца 2026-10-22
- [x] Скриншоты в `preview/`: 720 и 360 px, светлая и тёмная, idle и ready
- [x] Тары в spai-ui и spai-thermal-calc-agent (`install:consumer`)
- [x] Гейт на стенде — владелец (принято 2026-10-22)
- [x] Публикация 0.42.0 — schemas → react, 2026-10-22
- [ ] `openspec archive attachment-choice-card-optional-skip -y` после влития PR
