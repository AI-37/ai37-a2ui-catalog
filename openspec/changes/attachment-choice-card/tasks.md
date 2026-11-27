# Tasks: AttachmentChoiceCard

- [x] Схема `attachment-choice-card.ts` + `CHAT_ATTACHMENTS_ROUTE`, регистрация (`index.ts`, `constants.ts`, `catalog.ts`)
- [x] Рендерер `attachment-choice-card*.tsx`, хук `use-attachment-upload.ts`, регистрация под `withReadOnlyGate`
- [x] Python-зеркало `models/attachment_choice_card.py`, `COMPONENT_MODELS`, экспорт
- [x] Фикстуры: valid ×2, invalid ×3
- [x] Тесты: схема, React (7 сценариев), Python (+ сверка JSON Schema)
- [x] Превью в `apps/demo` с имитацией ручки загрузки (`demo-attachment-host.ts`)
- [x] `export:public`, `verify:public`, `version:bump 0.41.0`, `CHANGELOG.md`
- [x] Тары в spai-ui (`install:consumer`)
- [x] Вёрстка приведена к канону `*Next` после замечания владельца
- [x] Структура по 4.4: один компонент на файл, типы в `*.types.ts`
- [x] Скриншоты в `preview/`: 720 и 360 px, светлая и тёмная, idle и ready
- [ ] Гейт глазами на стенде — владелец
- [ ] Публикация 0.41.0 — после «принято»
- [ ] `openspec archive attachment-choice-card -y` после влития PR
