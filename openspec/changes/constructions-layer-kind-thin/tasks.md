## 1. Контракт

- [x] 1.1 `constructionLayerKindSchema` + `'thin'`; Python-зеркало
- [x] 1.2 Фикстуры: valid `constructions-editor-thin.json`, invalid
      `constructions-editor-unknown-layer-kind.json`; тесты TS и Python

## 2. Рендерер `ConstructionsEditorNext`

- [x] 2.1 `layer-kind-labels.ts`, `layer-needs-thickness.ts`,
      `layer-kind-from-option.ts`
- [x] 2.2 `ConstructionsNextKindField` — селектор вида в форме слоя
- [x] 2.3 Выбор спец-записи справочника ставит `kind`
- [x] 2.4 Толщина: без нижней границы и с плейсхолдером у `vent-gap`/`thin`;
      сводка — «без толщины» приглушённо
- [x] 2.5 Сводка печатает вид под названием; λ у `thin` — «не учитывается»

## 3. Тесты рендерера

- [x] 3.1 Строка `thin`/`vent-gap` без толщины: подпись вида, нет предупреждения,
      карточка «готова»
- [x] 3.2 Селектор: «Тонкий слой» снимает λ/ключ, «Применить» уезжает с `kind`
- [x] 3.3 Спец-запись справочника ставит вид сразу

## 4. Гейт

- [x] 4.1 `pnpm run typecheck`, `pnpm run test:ts`
- [x] 4.2 `pnpm run export:public && pnpm run verify:public`, `public/` закоммичен
- [x] 4.3 `pnpm run version:bump 0.38.0` + раздел в `CHANGELOG.md`
- [ ] 4.4 Python-тесты (`uv run … pytest`) — в этой среде нет pyenv 3.13
- [ ] 4.5 Тары: `spai-ui`, `spai-teplo-calc`, `spai-chat-backend`; гейт на стенде
- [ ] 4.6 Публикация 0.38.0, потребители на версию из реестра
