## 1. Схема и регистрация

- [x] 1.1 `packages/catalog-schemas/src/components/lift-editor.ts`: definition
      `liftEditorNextDefinition` с `name: 'LiftEditorNext'`, `slug:
      'lift-editor-next'` на той же `liftEditorPropsSchema`; нынешний
      definition не трогать
- [x] 1.2 `packages/catalog-schemas/src/catalog.ts`: новый definition в
      `componentDefinitions` рядом со старым
- [x] 1.3 `packages/catalog-schemas/src/constants.ts`: `'LiftEditorNext'` в
      `CATALOG_COMPONENT_NAMES`
- [x] 1.4 `description` нового definition пишет, чем он отличается (примитивы,
      клавиатура) и что props те же — по образцу `constructionsEditorNextDefinition`

## 2. Примитивы переезжают в пакет

- [x] 2.1 Перенести в `packages/catalog-react/src/primitives` примитивы,
      заведённые в `proba-lift-assembly`: секция-раскрывашка с бейджем,
      переключатель методики в шапке карточки, свёрнутый блок «Параметры по
      умолчанию», подпись источника у поля
- [x] 2.2 Литералов цвета и кегля в перенесённых примитивах не оставить —
      только токены слоями
- [x] 2.3 `/proba/system`: перенесённые примитивы показаны с осями и
      состояниями (правило реестра); в `primitives` не осталось ничего, чего
      нет на витрине

## 3. Рендерер `LiftEditorNext`

- [x] 3.1 Перенести `apps/demo/src/proba/lift-*` (кроме страницы и загрузки
      фикстур) в `packages/catalog-react/src/renderers/lift-editor-next*`
- [x] 3.2 Источник наполнения — props компонента вместо фикстуры песочницы;
      `createComponentImplementation(liftEditorNextDefinition, …)`
- [x] 3.3 Ветка `per-lift`: «Здание» + «Лифт 1…N», добавление и удаление в
      пределах `maxLifts`
- [x] 3.4 Ветка `group`: «Здание» + одна секция лифтовой группы, без
      добавления и удаления
- [x] 3.5 Переключатель методики: локальная перестройка формы, значения
      неактивных веток живут в рендерере, наружу — черновик активной
- [x] 3.6 Зависимые ряды по `dependentRules` наполнения; несовместимое
      выбранное значение сбрасывается при смене типа здания
- [x] 3.7 Перенести доменное поведение как есть: бейджи секций, двухрежимная
      кнопка, дебаунс правки поля против немедленных событий (add/remove,
      смена методики, «Далее»), снятие подписей источников правкой
- [x] 3.8 Ветвления разметки — отдельными компонентами с ранним `return null`
- [x] 3.9 `packages/catalog-react/src/catalog.ts` и `index.ts`: регистрация и
      экспорт рядом со старым

## 4. Публичные артефакты

- [x] 4.1 `pnpm run export:public` — `catalog.json` и
      `components/lift-editor-next.schema.json` перегенерированы
- [x] 4.2 `pnpm run verify:public` — зелёный
- [x] 4.3 Проверить, что запись `lift-editor-next` в `catalog.json` ссылается
      на существующую схему

## 5. Демо и песочница

- [x] 5.1 `apps/demo/src/create-surface-messages.ts`: старый и новый на одном
      наполнении, обе методики; сообщения подписаны так, чтобы было видно, где
      какой
- [x] 5.2 `apps/demo/src/proba/lift-assembly-page.tsx` импортирует части
      экрана из пакета; копии в песочнице удалены
- [x] 5.3 `apps/demo/src/proba/README.md` — дерево сборки указывает на пакет

## 6. Тесты

- [x] 6.1 `tests/react/lift-editor-next.test.tsx`: рендер обеих методик,
      add/remove в `per-lift`, отсутствие add/remove в `group`
- [x] 6.2 Переключение методики: форма перестроилась, значения прежней ветки
      сохранились, наружу ушёл черновик активной
- [x] 6.3 Черновик: дебаунс на правке поля, немедленные события на add/remove,
      смене методики и «Далее»
- [x] 6.4 Зависимые ряды: смена типа здания пересобирает значения и сбрасывает
      несовместимое
- [x] 6.5 Убедиться, что тесты нынешнего `LiftEditor` не тронуты и зелёные
- [x] 6.6 `pnpm run test:ts` и `pnpm run typecheck` — зелёные

## 7. Приёмка

- [x] 7.1 Проход клавиатурой по сценариям спеки в обеих ветках: `Tab` по
      порядку чтения, `Enter`/`Space` на секциях, `↓`/`Enter`/`Escape` в
      списках, `↑`/`↓` в числовых, переключатель методики с клавиатуры
- [x] 7.2 `aria-expanded`, `aria-controls`, `aria-label` у icon-only кнопок
      (добавление/удаление лифта), связь поля с подписью источника
- [x] 7.3 Попапы не срезаются краем карточки (портал в `body`)
- [x] 7.4 Скриншоты обеих методик в двух ширинах контейнера, старый и новый
      рядом
- [ ] 7.5 Проверить под хостовыми стилями (`.a2ui-surface button:hover` и
      т.п.), что хост не перекрашивает кнопки
- [ ] 7.6 Живой прогон на стенде — **требует переключателя имени в
      `spai-elevator-calc-agent`** (отдельное изменение, см. `proposal.md`);
      локально: `pnpm run install:consumer ../spai-ui`
- [x] 7.7 CHANGELOG: запись в `## [Unreleased]` про `LiftEditorNext`
