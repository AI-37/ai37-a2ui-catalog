# constructions-editor Specification

## Purpose
TBD - created by archiving change constructions-editor. Update Purpose after archive.
## Requirements
### Requirement: Компонент ConstructionsEditor в каталоге v2

Каталог SHALL предоставлять компонент `ConstructionsEditor` со strict-схемой
props (`constructions[]`, `typeConfigs[]`, `condition?`,
`materialsReferenceId`, лейблы и имена action'ов submit/back) в
`catalog-schemas`, рендерером в `catalog-react`, зеркальной моделью в
`catalog-python` и регистрацией во всех точках каталога
(`componentDefinitions`, `CATALOG_COMPONENT_NAMES`, `customComponents`,
python-экспорт). Добавление SHALL быть аддитивным: `CATALOG_VERSION`
остаётся `v2`, существующие компоненты не меняются.

#### Scenario: Валидная фикстура проходит все три схемы

- **WHEN** props-фикстура `fixtures/valid/constructions-editor.json`
  валидируется Zod-схемой, JSON Schema-артефактом и Pydantic-моделью
- **THEN** все три принимают её без ошибок; фикстуры из
  `fixtures/invalid/…` все три отклоняют

#### Scenario: Рендер из surface-сообщения

- **WHEN** `MessageProcessor` получает
  `fixtures/messages/constructions-editor-surface.json`
- **THEN** `A2uiSurface` рендерит карточки конструкций из фикстуры без
  ошибки «unknown component»

### Requirement: Редактирование целиком на клиенте

Рендерер SHALL держать рабочую копию конструкций в локальном state
(инициализация из `props.constructions`) и SHALL поддерживать без каких-либо
action'ов и сетевых вызовов (кроме подсказок lookup и черновиков
`draftAction` по коммитам — см. `constructions-editor-draft`):
раскрытие/сворачивание карточек, правку типа/subtype/названия, редактирование
слоёв через форму слоя с коммитом «Применить» (см.
`constructions-editor-inline-layers`), добавление слоя через форму с коммитом
«Добавить», удаление слоя из формы, добавление и удаление конструкций, ввод
`rprPassport` для типов с `hasLayers: false` (вместо списка слоёв). Правки
полей слоя SHALL попадать в state только по коммиту формы; правки полей шапки
конструкции — как прежде, сразу.

#### Scenario: Добавление и удаление слоя

- **WHEN** пользователь нажимает «+ Слой», заполняет форму, нажимает
  «Добавить», затем открывает форму другого слоя и удаляет его
- **THEN** список слоёв обновляется по каждому коммиту, сетевых запросов
  кроме подсказок и черновика не было

#### Scenario: Тип без слоёв

- **WHEN** тип карточки меняется на тип с `hasLayers: false` (окно/дверь)
- **THEN** вместо списка слоёв рендерится одно поле «Rпр по паспорту»

### Requirement: Lookup материала в строке слоя fetch-каналом

Строка слоя SHALL запрашивать подсказки существующим fetch-каналом каталога:
debounced same-origin GET `LOOKUP_SUGGEST_ROUTE` c `referenceId =
props.materialsReferenceId` и введённым query (порог `minChars`, отмена
in-flight запроса). Выбор опции с полями `lambdaA`/`lambdaB` SHALL заполнить
`materialKey` и λ строки (ввод ручной λ скрывается); выбор опции без λ или
свободный текст SHALL переключить строку на обязательный ручной ввод
`lambdaManual`. Сбой канала — тихий fallback: пустой дропдаун, поле
редактируемо. Fetch/debounce-логика SHALL быть вынесена в переиспользуемый
хук; поведение lookup-поля FormCard SHALL остаться без изменений.

#### Scenario: Выбор материала из прил. М

- **WHEN** пользователь вводит ≥ minChars символов и выбирает опцию с
  `lambdaB`
- **THEN** в строке материал и λ («авто») заполнены из опции, ручное поле λ
  не показывается

#### Scenario: Материал вне справочника

- **WHEN** пользователь оставляет свободный текст без выбора опции
- **THEN** строка показывает обязательное поле ручной λ

#### Scenario: Регрессия FormCard

- **WHEN** прогоняются существующие тесты lookup-поля FormCard (fetch-канал)
- **THEN** они проходят без изменений после выноса хука

### Requirement: Live-расчёт Rпр на карточке

Для типов со слоями компонент SHALL на каждое изменение пересчитывать
`Rпр = 1/alphaV + 1/alphaN + Σ (thicknessMm/1000)/λ`, где λ строки:
`lambdaManual`, иначе `lambdaA` при `condition === 'А'`, иначе `lambdaB`
(дефолт при отсутствии `condition` — λБ). Спец-кейсы: subtype без записи в
record `alphaN` (пол по грунту) — член `1/αн` опускается; строки-зазоры
(`kind` ≠ `material`) в сумме пропускаются; для типов без слоёв Rпр = введённый
`rprPassport`. Чип карточки SHALL сравнивать Rпр с `rnorm` типа
(зелёный ≥ / красный <); при отсутствии `rnorm` сравнение SHALL NOT
показываться. Сводка SHALL показывать «проходит N из M».

#### Scenario: Изменение толщины пересчитывает чип

- **WHEN** пользователь увеличивает толщину утеплителя так, что Rпр
  пересекает `rnorm`
- **THEN** чип карточки меняется с красного «<» на зелёный «≥» без
  каких-либо action'ов, сводка N из M обновляется

#### Scenario: λ по условию эксплуатации

- **WHEN** `condition` в props отсутствует и у строки есть `lambdaA` и
  `lambdaB`
- **THEN** live-расчёт использует `lambdaB`

#### Scenario: Пол по грунту

- **WHEN** карточка типа `cherdachnye_podval_grunt` с subtype `pol_po_gruntu`
- **THEN** live-Rпр не содержит члена `1/αн` (а не делит на отсутствующее
  значение)

### Requirement: Один submit с полным массивом и клиентской валидацией

Кнопка submit SHALL вызывать один
`dispatchAction({event: {name: props.submitAction, context: {constructions:
<текущий массив состояния>}}})`. До dispatch компонент SHALL валидировать:
непустой материал и положительная толщина у каждой строки слоя, ручная λ у
строк без λ из справочника, `rprPassport` у типов без слоёв; при нарушениях
submit SHALL блокироваться с подсветкой проблемных строк без dispatch.
Кнопка back SHALL вызывать `dispatchAction` c `props.backAction`/
`props.backActionContext` без валидации.

#### Scenario: Полный payload одним action'ом

- **WHEN** все карточки валидны и пользователь нажимает submit
- **THEN** вызывается ровно один `dispatchAction`, в `context.constructions`
  — все конструкции со всеми строками слоёв текущего состояния

#### Scenario: Блокировка невалидного submit

- **WHEN** у одной строки не заполнена толщина и пользователь нажимает submit
- **THEN** `dispatchAction` не вызывается, строка подсвечена

#### Scenario: Back без валидации

- **WHEN** в редакторе есть незаполненные строки и пользователь нажимает back
- **THEN** вызывается `dispatchAction` с `props.backAction` и
  `props.backActionContext`

