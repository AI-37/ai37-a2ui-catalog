## ADDED Requirements

### Requirement: Схема props компонента ThermalReport

Каталог SHALL предоставлять компонент `ThermalReport` со strict-схемой props:
обязательные `verdict` ({status: 'pass'|'fail', badge, headline, summary?}) и
`inputs` ({action?, groups: [{label, tone: 'normal'|'warning',
chips: [{label, value}], note?}]}); опциональные `checks`
([{title, detail?, status: 'pass'|'fail'|'info'}]), `layersTable`
({title, meta?, columns, rows, footer: {label, value}}), `constructions`
([{id, name, detail, deviationPct?, action?}]), `excluded`
({title, detail?, action?}), `assumptions` (string[]), `protocol`
({meta?, content}). Действие — объект {name, label, payload?}. Все значения —
готовые строки; единственное число — `deviationPct`.

#### Scenario: Валидная фикстура одной конструкции

- **WHEN** props содержат verdict, checks, layersTable, inputs, protocol
- **THEN** схема принимает объект, компонент попадает в артефакт каталога
  вместе с JSON-схемой

#### Scenario: Лишнее поле

- **WHEN** в props передан не описанный схемой ключ
- **THEN** strict-схема отклоняет объект

### Requirement: Рендер вердикта и статусных цветов

Рендерер SHALL показывать бейдж со статусной точкой (pass — success,
fail — danger), крупный headline и summary; чип отклонения конструкции SHALL
окрашиваться по знаку `deviationPct` (≥ 0 — success, < 0 — danger) и
форматироваться с явным знаком, десятичной запятой и «%».

#### Scenario: Непроходящая конструкция в списке

- **WHEN** конструкция имеет `deviationPct: -23.3` и действие «Подобрать»
- **THEN** рендерится чип «−23,3 %» в danger-цвете и кнопка действия

#### Scenario: Проходящая конструкция

- **WHEN** конструкция имеет `deviationPct: 1.9` без действия
- **THEN** рендерится чип «+1,9 %» в success-цвете, кнопки нет

### Requirement: Действия диспатчатся агенту с payload

Клик по кнопке действия (у конструкции, у исключённых, у исходных данных)
SHALL вызывать `dispatchAction` c `{event: {name: action.name,
context: action.payload ?? {}}}`.

#### Scenario: Подобрать у конструкции

- **WHEN** пользователь нажимает «Подобрать» с
  `{name: 'report_fix_construction', payload: {constructionId: 'w1'}}`
- **THEN** диспатчится событие `report_fix_construction` с
  `context.constructionId === 'w1'`

### Requirement: Протокол свёрнут по умолчанию

Секция `protocol` SHALL рендериться свёрнутой (нативный `<details>`) со
строкой-сводкой (`meta`) и раскрывать `content` — краткий текстовый вывод
расчёта (полная markdown-простыня в чат не выводится). При заданном
`downloadFileName` в строке-сводке SHALL быть кнопка «Скачать», отдающая
клиентским Blob'ом `downloadContent` (полную простыню; без него — `content`)
под этим именем файла, не раскрывая протокол; без `downloadFileName` кнопки
нет.

#### Scenario: Раскрытие протокола

- **WHEN** пользователь раскрывает «Протокол расчёта»
- **THEN** показывается полный content; повторный клик сворачивает

#### Scenario: Скачивание протокола

- **WHEN** пользователь нажимает «Скачать» при заданных `downloadFileName` и
  `downloadContent`
- **THEN** браузер сохраняет `downloadContent` (полную простыню) файлом с
  этим именем, протокол при этом не раскрывается

### Requirement: Группы исходных данных различаются тоном

Группа `inputs.groups` с `tone: 'warning'` («принято системой — проверьте»)
SHALL визуально отличаться от `tone: 'normal'` (пунктирные чипы,
предупреждающий цвет заголовка) и показывать `note` под чипами.

#### Scenario: Допущения системы

- **WHEN** группа warning содержит чипы условий эксплуатации и note
- **THEN** чипы рендерятся пунктирной рамкой, заголовок — warning-цветом,
  note — приглушённым текстом под чипами
