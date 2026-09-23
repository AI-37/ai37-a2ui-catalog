# Tasks: lift-editor-note-rules

- [x] Схема: `liftEditorFieldNoteSchema`, `note` в строке правила, `set` опционален, проверка «set или note» в `superRefine`
- [x] Python-зеркало: `LiftEditorFieldNote`, `LiftEditorDependentRuleRow.set/note`, валидатор
- [x] `collectRuleTargets` / `applyDependentRules`: `row.set ?? {}`
- [x] `collectRuleNotes` + приоритет note → source → hint в `LiftNextFieldNote` и `LiftEditorField`
- [x] Стили прежнего рендерера: `a2ui-le-caption--warning|--muted`
- [x] Фикстуры: `valid/lift-editor-note-rule.json`, `invalid/lift-editor-rule-row-empty.json`
- [x] Тесты: схема, python, `collect-rule-notes`, оба рендерера
- [x] Bump 0.37.0, CHANGELOG, `export:public`
- [x] Превью в demo: `lift-note-rule-preview`
- [x] Тарболлы: `spai-ui`, `spai-elevator-calc-agent`
- [ ] Гейт этапа 6: проверка пользователем на стенде (после среза C агента — правило эмитит агент)
- [ ] Публикация 0.37.0 в реестр, потребители с тарболлов на реестр
