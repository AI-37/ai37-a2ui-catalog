# Changelog

All notable changes to this repository should be recorded in this file.

The format follows Keep a Changelog with version headings in the form `## [x.y.z] - YYYY-MM-DD`.

## [0.11.0] - 2026-08-10

### Changed

- `ConstructionsEditor` (change `constructions-editor-header-edit`, только
  `catalog-react` и демо — схемы props, payload черновика и submit'а прежние):
  шапка раскрытой карточки по умолчанию — режим чтения, тип с разновидностью
  и название текстом рядом с кнопкой «Изменить». Всегда раскрытые селекты
  типа/разновидности и инпут названия уехали в форму шапки с кнопками
  «Сохранить» / «Отмена»; правки живут в локальной копии полей, до коммита
  заголовок карточки, live-Rпр и состояние редактора не меняются.
  «Сохранить» без изменений равносилен «Отмене».
- «Rпр по паспорту» (типы без слоёв) — тот же паттерн отдельным элементом:
  значение текстом («не задано» предупреждающим цветом) с кнопкой «Изменить»,
  правка — в форме с числовым инпутом и кнопками «Применить» / «Отмена».
- Правило «одна форма на весь редактор» распространено на формы любого вида:
  слой, шапка и паспортное Rпр делят одно место, открытие любой закрывает
  текущую с отбросом несохранённых правок (`editingLayer` в состоянии
  редактора стал `editingTarget`).
- Черновик `draftAction` шлётся ещё и по коммитам «Сохранить» формы шапки и
  «Применить» формы паспортного Rпр — с изменёнными полями; коммит без
  изменений и ввод внутри незакоммиченной формы action'ов не порождают.
  Раньше правки шапки и паспортного Rпр молча мутировали state на каждый ввод
  и черновиком не уезжали вовсе.

## [0.10.0] - 2026-08-08

### Changed

- `ConstructionsEditor` (change `constructions-editor-inline-layer-edit`,
  только `catalog-react` и демо — схемы props и python-модели не менялись):
  слой раскрытой конструкции по умолчанию — компактная строка-сводка
  `№ · материал · толщина · λ` (λ со значком «авто» у справочной, значение у
  ручной, «λ не задана» у незаполненной; у зазоров — прежняя пометка про Rs).
  Клик по строке раскрывает форму редактирования; форма одна на весь
  редактор, переключение на другую строку отбрасывает несохранённые правки.
- Форма слоя редактирует локальную копию с явным коммитом: «Применить»
  записывает копию в состояние редактора (до этого live-Rпр, строки-сводки и
  черновики не меняются), «Отмена» закрывает без следа, «Удалить слой»
  переехал в форму. «+ Слой» открывает пустую форму с кнопкой «Добавить» —
  пустые строки больше не вставляются в state немедленно.
- Черновик `draftAction` шлётся по каждому коммиту состояния конструкций:
  add/remove конструкции (как прежде) плюс «Применить» с изменёнными полями,
  «Добавить», «Удалить слой». «Применить» без изменений action не порождает.
  Эвристика «структурная правка = изменилась длина `layers`» удалена —
  коммит теперь явное событие карточки. Payload прежний.

### Added

- Подсветка невалидной конструкции: карточка (и свернутая, и раскрытая) с
  материальным слоем без λ/толщины/материала — или типом без слоёв без
  `rprPassport` — подсвечивается предупреждающим цветом с пометкой
  «! проверить»; незаполненные фрагменты строк-сводок — тем же цветом.
  Состояние производное, считается на клиенте (`find-invalid-layers.ts`),
  гаснет само при исправлении; submit не блокируется, action'ов нет.
- Цветовой токен `--a2ui-color-warning` (`tokens.warning`).

## [0.9.0] - 2026-08-04

### Added

- `ConstructionsEditor`: вкладки «Общие данные» и «Конструкции» одним экраном
  (change `constructions-editor-general-tab`, аддитивно в v2). Переключение
  локальное, без action'ов; ввод обеих вкладок переживает переключение.
  Новый опциональный блок props `general` (`buildingType`, `city`, `tot`,
  `zot`, `tn`, `tv`, `condition`; незаполненное — `null`) плюс
  `buildingTypeOptions`, `cityReferenceId`, `generalTabLabel`,
  `constructionsTabLabel`, `nextLabel`. На вкладке общих данных кнопка
  «Далее» (подпись — `nextLabel`) ведёт к конструкциям, не отправляя ничего
  агенту; submit и сводка «проходит N из M» живут на вкладке конструкций.
  Выбор города в lookup'е (тот же fetch-канал, что у
  материалов) подставляет `tot`/`zot`/`tn` из полей опции — значения остаются
  редактируемыми.
- Пустой `general.buildingType` подставляет первый вариант
  `buildingTypeOptions` (список упорядочен агентом, первый — значение по
  умолчанию); пустой выбор остаётся доступным. Подписи полей климата несут
  обозначение с индексом и расшифровку (`tот — средняя темп. отопительного
  периода, °C`).
- Python-модели `ConstructionsGeneral`/`ConstructionsCity`, фикстура
  `fixtures/invalid/constructions-editor-unknown-general-key.json`.
- Демо: превью показывает объединённый экран; справочник `cities`
  dev-middleware отдаёт опции с климатом (ориентировочным, для превью).

### Changed

- Карточки конструкций на старте свёрнуты (видны заголовок и чип Rпр) — при
  десятке конструкций экран перестаёт быть простынёй; добавленная карточка
  раскрывается сразу. Заголовок выровнен по левому краю, треугольник заменён
  на поворачивающийся шеврон.
- **Submit больше не блокируется клиентом**: `submitAction` уходит при каждом
  нажатии с полным состоянием `{general, constructions}` как есть — включая
  пустые и невалидные записи. О недостающем сообщает агент; клиентская
  валидация с подсветкой удалена вместе с `validate-constructions.ts`.
- Сравнение `Rпр` с `Rнорм` и сводка «проходит N из M» показываются, только
  пока поля климата (`tot`, `zot`, `tn`, `tv`, `buildingType`, `city`) не
  менялись с момента получения props: присланный `rnorm` посчитан агентом из
  прежнего климата. После правки чип показывает `Rпр` без сравнения — до
  следующих props с пересчитанным `rnorm`.
- Выбор λА/λБ берётся из `general.condition`; top-level проп `condition`
  остаётся начальным значением и помечен deprecated. Нет значения — λБ, как
  на сервере.
- `draftAction` шлёт `{general, constructions}` — тот же payload, что у
  submit'а. Триггеры прежние (структурные правки списка конструкций).
- `backLabel`/`backAction` стали опциональными: без них кнопка возврата не
  рендерится. Без пропа `general` компонент работает как раньше — одна
  вкладка конструкций и submit с `{constructions}` (путь отката).

## [0.8.0] - 2026-08-04

### Added

- `ConstructionsEditor`: опциональный проп `draftAction` — автосохранение
  черновика (change `constructions-editor-draft-save`, аддитивно в v2). При
  заданном пропе компонент шлёт `dispatchAction({name: draftAction,
  context: {constructions}})` на структурных правках — добавление/удаление
  конструкции и добавление/удаление слоя — с полным текущим массивом (тот же
  payload, что у submit'а, включая незаполненные записи). Правки полей сами
  по себе автосейв не запускают и уезжают с ближайшим структурным действием
  либо с submit'ом; ответ агента компонент не читает, локальный state
  остаётся источником правды. Без пропа поведение прежнее — наружу только
  submit и back.
- Python-модель и фикстуры: `draftAction` в `ConstructionsEditorProps`,
  `fixtures/invalid/constructions-editor-empty-draft-action.json`.
- Демо: превью ConstructionsEditor включает `draftAction` и логирует
  отправленный черновик в консоль.

## [0.7.0] - 2026-08-02

### Added

- Новый компонент каталога `ConstructionsEditor` (change `constructions-editor`,
  аддитивно в v2): редактор конструкций одним сообщением для агента
  teplo-calc. Карточки-аккордеоны (тип/subtype/название), таблица слоёв с
  add/remove строк, per-row lookup материала fetch-каналом
  (`LOOKUP_SUGGEST_ROUTE`, опции могут нести `lambdaA`/`lambdaB`), ручная λ
  для материалов вне справочника, паспортное Rпр для типов без слоёв,
  live-чип `Rпр = 1/αв + 1/αн + Σ δ/λ` против Rнорм (λ-дефолт «нет condition
  → λБ» синхронизирован с серверным `resolve-layer-lambda` teplo-calc;
  спец-кейсы: пол по грунту без `1/αн`, строки-зазоры пропускаются), сводка
  «проходит N из M». Все правки на клиенте; наружу — один submit с полным
  массивом конструкций в `context` и back без валидации; клиентская
  валидация с подсветкой блокирует невалидный submit.
- `@ai37/a2ui-catalog-schemas`: `constructionsEditorPropsSchema` + схемы
  слоя/конструкции/`typeConfigs` и производные типы.
- `@ai37/a2ui-catalog-react`: рендерер `ConstructionsEditor` (карточка,
  строка слоя — подфайлы) + экспорт `resolveLayerLambda`/`computeLiveRpr`
  для сверки клиент/сервер; токен `--a2ui-color-success` для чипа «проходит».
- Python-модель (`ai37-a2ui-catalog`): `ConstructionsEditorProps` + вложенные
  модели — зеркало zod-схемы (parity-тест расширен канонизацией draft-4
  `exclusiveMinimum` и `additionalProperties: {} ≡ true`).
- Демо: превью ConstructionsEditor; dev-middleware `/api/reference-suggest`
  дополнен справочником `sp50-materials` с λА/λБ в опциях.

### Changed

- Рефактор без изменения поведения: fetch/debounce/abort-логика lookup
  вынесена из `LookupFieldFetchControl` в переиспользуемый хук
  `useLookupSuggest` (`use-lookup-suggest.ts`); контрол — тонкая обёртка,
  существующие тесты FormCard-lookup прошли без правок.

## [0.6.0] - 2026-07-14

### Added

- FormCard lookup: второй режим подсказок `suggestMode: 'fetch'` (change
  `form-card-lookup-fetch-e2e`). Поле с `suggestMode: 'fetch'` запрашивает
  опции само — debounced `GET /api/reference-suggest?referenceId=&query=`
  (same-origin, через BFF потребителя → оркестратор → REST-ручка
  агента-владельца справочника) с отменой in-flight (`AbortController`) и
  тихим fallback на любой сбой. Дефолт (`suggestMode` не задан) — прежний
  action-канал `lookup:suggest`, поведение существующих сообщений не
  меняется.
- `@ai37/a2ui-catalog-schemas`: `lookupSuggestModeSchema`,
  `LOOKUP_SUGGEST_ROUTE`, `LOOKUP_DEBOUNCE_MS`, тип `LookupSuggestResponse` —
  единый источник контракта fetch-канала для BFF/оркестратора/агентов.
- `@ai37/a2ui-catalog-react`: рендерер lookup разобран на диспетчер
  (`lookup-field`), `lookup-field-action`, `lookup-field-fetch` и общий
  презентационный `lookup-combobox`.
- Python-модель (`ai37-a2ui-catalog`): `LookupSuggestMode`,
  `FormField.suggestMode` — зеркало zod-схемы.
- Демо: dev-middleware `/api/reference-suggest` (vite) и превью fetch-режима.

## [0.3.1] - 2026-06-21

### Fixed

- `@ai37/a2ui-catalog-react` FormCard: submit-кнопка теперь канонически диспатчит
  action со значениями полей через `context.dispatchAction({event:{name, context}})`
  → значения долетают агенту в `userAction.context`. Раньше кнопка ставила
  `data-action`-атрибут без обработчика — action не отправлялся (требовал костыля
  у потребителя). Схема FormCard не изменена. `catalog-react` 0.4.2 → 0.4.3.

## [0.3.0] - 2026-06-17

### Added

- `A2UI_BASE_CATALOG_ID` — id базового каталога A2UI (`basicCatalog`), для content-negotiation вывода (`@ai37/agent-sdk`): MIME `application/vnd.a2ui+json` → base, `application/vnd.a2ui.ai37+json` → `CATALOG_ID`.
- Workflow `pages.yml`: публикация артефактов каталога на GitHub Pages.

### Changed

- **BREAKING:** хостинг каталога переехал на GitHub Pages — `CATALOG_BASE_URL`/`CATALOG_ID` теперь `https://ai-37.github.io/ai37-a2ui-catalog/...` (было `a2ui-schemas.dev.ai37.ru`). `catalogId` в каждом A2UI-payload меняется соответственно.

### Removed

- Старый способ хостинга артефактов: `Dockerfile`, `.dockerignore`, `chart/` (Helm) и CD-джобы `publish_container`/`deploy` — заменены публикацией на GitHub Pages.

## [0.2.1] - 2026.06.14

### Changed

- Replace hardcoded colors with tokens with further theming support

## [0.2.0] - 2026-06-13

### Added

- Interactive human-in-the-loop components `ChoiceCard` (single/multi select) and `FormCard` (typed fields) across all three layers: canonical Zod schemas, React renderers, and Python Pydantic models.
- Valid and invalid fixtures plus surface messages for the new components, with matching TypeScript, React, and Python tests.

## [0.1.0] - 2026-06-02

### Added

- Initial AI37 A2UI catalog monorepo with shared Zod schemas, React renderers, and Python validation models.
- Schema export CLI, static Docker image, and Helm chart for publishing catalog artifacts on `a2ui-schemas.dev.ai37.ru`.
- Cross-language test coverage for TypeScript renderers, Python models, and schema consistency.
- GitHub Actions CI and CD workflows for validation, publishing, and deployment automation.
